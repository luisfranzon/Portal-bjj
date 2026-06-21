import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as AuthUser } from 'firebase/auth';
import {
  auth,
  saveTechnique,
  subscribeToTechniques,
  deleteTechnique,
  logout
} from './firebase';
import type { Technique } from './types';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LessonViewer from './components/LessonViewer';
import TechniqueModal from './components/TechniqueModal';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [techniques, setTechniques] = useState<Technique[]>([]);

  // Navigation state
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'lesson'>('dashboard');
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);

  // Drilldown and filter states
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [beltFilter, setBeltFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTechnique, setEditingTechnique] = useState<Technique | null>(null);

  // Auth monitor
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Real-time Firestore subscription
  useEffect(() => {
    if (!user) {
      setTechniques([]);
      return;
    }

    setDataLoading(true);
    const unsubscribe = subscribeToTechniques(
      user.uid,
      (data) => {
        setTechniques(data);
        setDataLoading(false);
        
        // Keep the currently selected technique updated if it changes in database
        if (selectedTechnique) {
          const updated = data.find((t) => t.id === selectedTechnique.id);
          if (updated) {
            setSelectedTechnique(updated);
          } else {
            // It was deleted
            setSelectedTechnique(null);
            setSelectedTab('dashboard');
          }
        }
      },
      (error) => {
        console.error('Falha de sincronização real-time: ', error);
        setDataLoading(false);
      }
    );

    return unsubscribe;
  }, [user, selectedTechnique?.id]);

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair do portal?')) {
      try {
        await logout();
        setSelectedTechnique(null);
        setSelectedTab('dashboard');
      } catch (e) {
        console.error(e);
      }
    }
  };

  // CRUD handlers
  const handleSaveTechnique = async (
    techniqueRaw: Omit<Technique, 'userId' | 'createdAt' | 'updatedAt'>,
    isEdit: boolean
  ) => {
    try {
      await saveTechnique(techniqueRaw, isEdit);
      setIsModalOpen(false);
      setEditingTechnique(null);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar posição no banco.');
    }
  };

  const handleDeleteTechnique = async (id: string) => {
    if (window.confirm('Deseja excluir permanentemente esta posição técnica?')) {
      try {
        await deleteTechnique(id);
        if (selectedTechnique?.id === id) {
          setSelectedTechnique(null);
          setSelectedTab('dashboard');
        }
      } catch (e) {
        console.error(e);
        alert('Erro ao excluir do banco.');
      }
    }
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    const match = techniques.find((t) => t.id === id);
    if (!match) return;

    try {
      await saveTechnique(
        {
          id: match.id,
          name: match.name,
          group: match.group,
          description: match.description || '',
          videoUrl: match.videoUrl || '',
          testedInSparring: match.testedInSparring,
          progress: Number(progress),
        },
        true
      );
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar progresso.');
    }
  };

  const handleToggleSparring = async (id: string, currentStatus: boolean) => {
    const match = techniques.find((t) => t.id === id);
    if (!match) return;

    try {
      await saveTechnique(
        {
          id: match.id,
          name: match.name,
          group: match.group,
          description: match.description || '',
          videoUrl: match.videoUrl || '',
          testedInSparring: !currentStatus,
          progress: match.progress,
        },
        true
      );
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar sparring.');
    }
  };

  const handleUpdateDescription = async (id: string, notes: string) => {
    const match = techniques.find((t) => t.id === id);
    if (!match) return;

    try {
      await saveTechnique(
        {
          id: match.id,
          name: match.name,
          group: match.group,
          description: notes,
          videoUrl: match.videoUrl || '',
          testedInSparring: match.testedInSparring,
          progress: match.progress,
        },
        true
      );
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar notas de treino.');
      throw e;
    }
  };



  const handleImportBackup = async (importedItems: any[]) => {
    if (!user) {
      alert('Usuário não autenticado.');
      return;
    }

    if (!Array.isArray(importedItems)) {
      alert('Arquivo inválido. O backup deve ser uma lista (array) de registros.');
      return;
    }

    if (importedItems.length === 0) {
      alert('O arquivo de backup está vazio.');
      return;
    }

    const confirmImport = window.confirm(
      `Deseja importar ${importedItems.length} registros (técnicas/treinos) para o seu banco de dados atual? Itens com o mesmo ID serão atualizados/sobrescritos.`
    );
    if (!confirmImport) return;

    setDataLoading(true);
    let success = 0;
    let failed = 0;

    for (const item of importedItems) {
      try {
        if (!item.id || !item.name || !item.group) {
          console.warn('Item ignorado devido a formato inválido:', item);
          failed++;
          continue;
        }

        const isEdit = techniques.some((t) => t.id === item.id);

        await saveTechnique(
          {
            id: item.id,
            name: item.name,
            group: item.group,
            description: item.description || '',
            progress: Number(item.progress) || 0,
            videoUrl: item.videoUrl || '',
            testedInSparring: Boolean(item.testedInSparring),
          },
          isEdit
        );
        success++;
      } catch (err) {
        console.error('Erro ao salvar item importado:', err);
        failed++;
      }
    }

    setDataLoading(false);
    alert(`Importação concluída!\nSucesso: ${success}\nFalhas: ${failed}`);
  };

  const openAddModal = () => {
    setEditingTechnique(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tech: Technique) => {
    setEditingTechnique(tech);
    setIsModalOpen(true);
  };

  // Renders
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 text-slate-800 font-sans">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase font-black text-slate-400 tracking-wider font-bold">
          Carregando Dojo Portal...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onLoginSuccess={() => {}}
        isLoading={authLoading}
        setIsLoading={setAuthLoading}
      />
    );
  }

  return (
    <div className="flex w-full h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        onAddTechnique={openAddModal}
        onLogout={handleLogout}
        userEmail={user.email}
      />

      {/* Main Content Pane */}
      <div className="flex-1 h-screen relative flex flex-col min-w-0">
        
        {dataLoading && techniques.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-bold">
              Sincronizando diário...
            </p>
          </div>
        ) : (
          <>
            {selectedTab === 'dashboard' && (
              <Dashboard
                techniques={techniques}
                onSelectTechnique={(tech) => {
                  setSelectedTechnique(tech);
                  setSelectedTab('lesson');
                }}
                onAddTechnique={openAddModal}
                onImportBackup={handleImportBackup}
                selectedModule={selectedModule}
                setSelectedModule={setSelectedModule}
                beltFilter={beltFilter}
                setBeltFilter={setBeltFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}



            {selectedTab === 'lesson' && selectedTechnique && (
              <LessonViewer
                technique={selectedTechnique}
                onEdit={openEditModal}
                onDelete={handleDeleteTechnique}
                onUpdateProgress={handleUpdateProgress}
                onToggleSparring={handleToggleSparring}
                onUpdateDescription={handleUpdateDescription}
                onBack={() => {
                  setSelectedTechnique(null);
                  setSelectedTab('dashboard');
                }}
              />
            )}
          </>
        )}

      </div>

      {/* Modals & Popups */}
      <TechniqueModal
        isOpen={isModalOpen}
        technique={editingTechnique}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTechnique(null);
        }}
        onSave={handleSaveTechnique}
      />

    </div>
  );
}
