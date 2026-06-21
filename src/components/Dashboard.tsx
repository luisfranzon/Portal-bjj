import { useMemo } from 'react';
import { DEFAULT_GROUPS } from '../types';
import type { Technique } from '../types';
import { getBeltForProgress } from '../utils/gym';
import LessonViewer from './LessonViewer';
import {
  Trophy,
  Award,
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  Search,
  ChevronRight,
  Shield,
  Zap,
  RotateCw,
  Activity,
  Sliders,
  ArrowRightLeft,
  HelpCircle,
  FolderOpen
} from 'lucide-react';

interface DashboardProps {
  techniques: Technique[];
  onSelectTechnique: (tech: Technique | null) => void;
  onAddTechnique: () => void;
  onImportBackup: (items: any[]) => void;
  selectedModule: string | null;
  setSelectedModule: (module: string | null) => void;
  beltFilter: string;
  setBeltFilter: (belt: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTechnique: Technique | null;
  onEditTechnique: (tech: Technique) => void;
  onDeleteTechnique: (id: string) => void | Promise<void>;
  onUpdateProgress: (id: string, progress: number) => void | Promise<void>;
  onToggleSparring: (id: string, current: boolean) => void | Promise<void>;
  onUpdateDescription: (id: string, notes: string) => void | Promise<void>;
}

const GROUP_ICONS: Record<string, any> = {
  'Guarda Fechada & Aberta': Shield,
  'Passagem de Guarda': Zap,
  'Raspagens (Sweeps)': RotateCw,
  'Finalizações (Submissions)': Trophy,
  'Quedas & Projeções (Takedowns)': Activity,
  'Defesas & Escapes (Escapes)': Sliders,
  'Controles & Posições (Positions)': ArrowRightLeft,
  'Outros': HelpCircle
};

export default function Dashboard({
  techniques,
  onSelectTechnique,
  onAddTechnique,
  onImportBackup,
  selectedModule,
  setSelectedModule,
  beltFilter,
  setBeltFilter,
  searchQuery,
  setSearchQuery,
  selectedTechnique,
  onEditTechnique,
  onDeleteTechnique,
  onUpdateProgress,
  onToggleSparring,
  onUpdateDescription
}: DashboardProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportBackup(json);
      } catch (err) {
        alert('Erro ao ler o arquivo JSON. Certifique-se de que é um JSON válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Separate techniques and training logs
  const actualTechniques = useMemo(() => {
    return techniques.filter((t) => t.description !== 'REGISTRO_TREINO');
  }, [techniques]);

  const trainingDocs = useMemo(() => {
    return techniques.filter((t) => t.description === 'REGISTRO_TREINO');
  }, [techniques]);

  // Total techniques count
  const total = actualTechniques.length;

  // Tested in Sparring
  const testedCount = useMemo(() => {
    return actualTechniques.filter((t) => t.testedInSparring).length;
  }, [actualTechniques]);

  const testedPercentage = total ? Math.round((testedCount / total) * 100) : 0;

  // Belt ranks count
  const beltDistribution = useMemo(() => {
    const counts = {
      'Faixa Branca': 0,
      'Faixa Azul': 0,
      'Faixa Roxa': 0,
      'Faixa Marrom': 0,
      'Faixa Preta': 0,
    };
    actualTechniques.forEach((t) => {
      const belt = getBeltForProgress(t.progress);
      if (belt.name in counts) {
        counts[belt.name as keyof typeof counts]++;
      }
    });
    return counts;
  }, [actualTechniques]);

  // Attendance stats
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const treinosMes = useMemo(() => {
    return trainingDocs.filter((t) => {
      const parts = t.name.split('-');
      return parseInt(parts[0]) === currentYear && parseInt(parts[1]) === currentMonth;
    }).length;
  }, [trainingDocs, currentYear, currentMonth]);

  // Category statistics (Total positions per group, and sparring stats)
  const categoryStats = useMemo(() => {
    const stats = DEFAULT_GROUPS.reduce((acc, group) => {
      acc[group] = { total: 0, tested: 0 };
      return acc;
    }, {} as Record<string, { total: number; tested: number }>);

    actualTechniques.forEach((t) => {
      const groupName = DEFAULT_GROUPS.includes(t.group as any) ? t.group : 'Outros';
      if (!stats[groupName]) {
        stats[groupName] = { total: 0, tested: 0 };
      }
      stats[groupName].total++;
      if (t.testedInSparring) {
        stats[groupName].tested++;
      }
    });

    return stats;
  }, [actualTechniques]);

  // Filter techniques based on current search and belt filters
  const filteredTechniques = useMemo(() => {
    return actualTechniques.filter((t) => {
      const matchesBelt = beltFilter === 'all' || getBeltForProgress(t.progress).name === beltFilter;
      const matchesSearch = !searchQuery.trim() || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesBelt && matchesSearch;
    });
  }, [actualTechniques, beltFilter, searchQuery]);

  // Recent techniques (Last 4 updated)
  const recentTechniques = useMemo(() => {
    const sorted = [...actualTechniques].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return sorted.slice(0, 4);
  }, [actualTechniques]);

  // Check if search filters are active
  const isFilterActive = searchQuery.trim() !== '' || beltFilter !== 'all';

  return (
    <div className="flex-1 h-screen flex flex-col lg:flex-row overflow-hidden bg-slate-50 text-slate-800 font-sans">
      
      {/* LEFT PANEL: Library Pane (Scrollable) */}
      <div className="flex-1 lg:w-3/5 h-full overflow-y-auto p-6 flex flex-col gap-6 border-r border-slate-200">
        {/* Header and Filter bar */}
        <div className="flex flex-col gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                Biblioteca Técnica BJJ
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
              Painel Geral do Dojo
            </h1>
          </div>

          {/* Top Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar nas posições..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm focus:ring-1 focus:ring-blue-400/20"
              />
            </div>

            {/* Belt Filters (Horizontal Buttons) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 custom-scrollbar w-full lg:w-auto">
              <span className="text-[10px] uppercase font-black text-slate-400 mr-1.5 shrink-0">Faixas:</span>
              {[
                { id: 'all', name: 'Todas', bg: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' },
                { id: 'Faixa Branca', name: 'Branca', bg: 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300' },
                { id: 'Faixa Azul', name: 'Azul', bg: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-sm' },
                { id: 'Faixa Roxa', name: 'Roxa', bg: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-sm' },
                { id: 'Faixa Marrom', name: 'Marrom', bg: 'bg-amber-800 hover:bg-amber-900 text-white border-amber-900 shadow-sm' },
                { id: 'Faixa Preta', name: 'Preta', bg: 'bg-slate-900 hover:bg-slate-950 text-amber-450 border-slate-950 shadow-sm' },
              ].map((item) => {
                const isSelected = beltFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setBeltFilter(item.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${
                      isSelected ? 'ring-2 ring-blue-500 ring-offset-1 scale-[0.98]' : 'hover:scale-[0.98]'
                    } ${item.bg}`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RENDER MODE A: Filters are Active (Direct listing of filtered techniques across all modules) */}
        {isFilterActive ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Resultados do Filtro ({filteredTechniques.length} posições encontradas)
              </h2>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setBeltFilter('all');
                }}
                className="text-[10px] font-bold text-blue-600 hover:underline ml-2"
              >
                Limpar Filtros
              </button>
            </div>

            {filteredTechniques.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-slate-400 text-sm italic">
                Nenhuma técnica corresponde aos filtros aplicados.
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredTechniques.map((tech) => {
                  const belt = getBeltForProgress(tech.progress);
                  const isSelected = selectedTechnique?.id === tech.id;
                  return (
                    <button
                      key={tech.id}
                      onClick={() => onSelectTechnique(tech)}
                      className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer group ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider truncate">
                          {tech.group}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {tech.testedInSparring && (
                            <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-250 px-1.5 py-0.5 rounded">
                              Rola
                            </span>
                          )}
                          <div className={`w-2.5 h-2.5 rounded-full ${belt.colorClass} border ${belt.borderColorClass} shrink-0`} />
                        </div>
                      </div>

                      <div>
                        <h4 className={`text-sm font-extrabold transition-colors mb-1.5 line-clamp-1 ${
                          isSelected ? 'text-blue-700 font-black' : 'text-slate-800 group-hover:text-blue-600'
                        }`}>
                          {tech.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 min-h-[2rem]">
                          {tech.description || 'Nenhuma anotação registrada ainda.'}
                        </p>
                      </div>

                      <div className="w-full space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] text-slate-555 font-bold">
                          <span>{belt.name}</span>
                          <span>{tech.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                          <div style={{ width: `${tech.progress}%` }} className={`h-full ${belt.colorClass}`} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* RENDER MODE B: Drilldown Mode (Standard Navigation) - Inline expandable modules */
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>Biblioteca de Módulos (Cursos)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {DEFAULT_GROUPS.map((group) => {
                const stats = categoryStats[group] || { total: 0, tested: 0 };
                const percent = stats.total ? Math.round((stats.tested / stats.total) * 100) : 0;
                const Icon = GROUP_ICONS[group] || HelpCircle;
                const isExpanded = selectedModule === group;

                // Filter techniques belonging to this group
                const groupTechniques = actualTechniques.filter(
                  (t) => t.group === group || (group === 'Outros' && !DEFAULT_GROUPS.includes(t.group as any))
                );

                return (
                  <div
                    key={group}
                    className={`rounded-2xl border transition-all flex flex-col overflow-hidden ${
                      isExpanded
                        ? 'border-blue-400 bg-white shadow-md ring-1 ring-blue-400/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedModule(isExpanded ? null : group)}
                      className="p-5 w-full text-left flex flex-col gap-4 focus:outline-none cursor-pointer group"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-3 rounded-xl transition-all shadow-inner ${
                          isExpanded ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-all transform ${
                          isExpanded ? 'rotate-90 text-blue-600' : 'group-hover:text-slate-655 group-hover:translate-x-0.5'
                        }`} />
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                          {group}
                        </h3>
                        <div className="flex justify-between items-center text-[10px] text-slate-555 font-bold">
                          <span>{stats.total} {stats.total === 1 ? 'posição' : 'posições'}</span>
                          {stats.total > 0 && <span>{percent}% rola</span>}
                        </div>
                      </div>

                      {stats.total > 0 && (
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full bg-blue-600 rounded-full"
                          />
                        </div>
                      )}
                    </button>

                    {/* Inline expanded technique list */}
                    {isExpanded && (
                      <div className="border-t border-slate-150 bg-slate-50/60 p-4 space-y-2">
                        {groupTechniques.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2 text-center">
                            Nenhuma técnica cadastrada neste módulo.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {groupTechniques.map((tech) => {
                              const isSelected = selectedTechnique?.id === tech.id;
                              const belt = getBeltForProgress(tech.progress);
                              return (
                                <button
                                  key={tech.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectTechnique(tech);
                                  }}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all active:scale-[0.99] cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-50 text-blue-750 font-extrabold border border-blue-200 shadow-sm'
                                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1 pr-2">
                                    <span className="truncate block">{tech.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {tech.testedInSparring && (
                                      <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-250 px-1.5 py-0.5 rounded">
                                        Rola
                                      </span>
                                    )}
                                    <div className={`w-2.5 h-2.5 rounded-full ${belt.colorClass} border ${belt.borderColorClass} shrink-0`} />
                                    <span className="text-[10px] text-slate-500 font-bold">{tech.progress}%</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Player or General Stats (Scrollable, white background) */}
      <div className="w-full lg:w-2/5 h-full overflow-y-auto bg-white border-l border-slate-200 flex flex-col min-w-0">
        {selectedTechnique ? (
          <LessonViewer
            technique={selectedTechnique}
            onEdit={onEditTechnique}
            onDelete={onDeleteTechnique}
            onUpdateProgress={onUpdateProgress}
            onToggleSparring={onToggleSparring}
            onUpdateDescription={onUpdateDescription}
            onBack={() => onSelectTechnique(null)}
          />
        ) : (
          <div className="p-6 flex flex-col gap-6">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Estatísticas do Aluno
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                Progresso no Tatame
              </h2>
            </div>

            {/* Stats Cards Stacked */}
            <div className="grid grid-cols-1 gap-4 shrink-0">
              {/* Card 1: Total Techniques */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">
                    Total de Posições
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">{total}</h3>
                  <p className="text-[10px] text-slate-550 font-semibold">Cadastradas no diário</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Sparring Mastery */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">
                    Domínio de Rola
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">{testedPercentage}%</h3>
                  <p className="text-[10px] text-slate-550 font-semibold">
                    {testedCount} de {total} técnicas testadas
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: Attendance */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">
                    Treinos no Mês
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">{treinosMes}</h3>
                  <p className="text-[10px] text-slate-555 font-semibold">Frequência registrada</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Belt Mastery Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm flex flex-col gap-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Nível de Maestria do Diário</span>
              </h2>

              <div className="space-y-3">
                {[
                  { name: 'Faixa Branca', color: 'bg-white', text: 'text-slate-800', border: 'border-slate-350' },
                  { name: 'Faixa Azul', color: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
                  { name: 'Faixa Roxa', color: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' },
                  { name: 'Faixa Marrom', color: 'bg-amber-800', text: 'text-white', border: 'border-amber-900' },
                  { name: 'Faixa Preta', color: 'bg-slate-900', text: 'text-amber-450', border: 'border-slate-950' },
                ].map((b) => {
                  const count = beltDistribution[b.name as keyof typeof beltDistribution] || 0;
                  const percentage = total ? Math.round((count / total) * 100) : 0;
                  
                  return (
                    <div key={b.name} className="flex items-center justify-between gap-3">
                      <div className="w-24 flex items-center gap-1.5 shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${b.color} border ${b.border} shrink-0`} />
                        <span className="text-[11px] font-bold text-slate-650 truncate">{b.name.replace('Faixa ', '')}</span>
                      </div>

                      <div className="flex-1 h-2.5 rounded-full bg-white overflow-hidden border border-slate-200 relative">
                        <div
                          style={{ width: `${percentage}%` }}
                          className={`h-full ${b.color} transition-all duration-500`}
                        />
                      </div>

                      <div className="w-14 text-right shrink-0 flex items-center justify-end gap-1">
                        <span className="text-[11px] font-extrabold text-slate-800">{count}</span>
                        <span className="text-[9px] text-slate-450 font-bold">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pausado em (Últimos Estudados) */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm flex flex-col gap-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Últimos Estudados</span>
              </h2>

              {recentTechniques.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs italic">
                  Nenhuma técnica estudada recentemente.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentTechniques.map((tech) => {
                    const belt = getBeltForProgress(tech.progress);
                    return (
                      <button
                        key={tech.id}
                        onClick={() => onSelectTechnique(tech)}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100/50 text-left flex items-center justify-between gap-3 active:scale-[0.98] transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-850 group-hover:text-blue-600 transition-colors truncate mb-0.5">
                            {tech.name}
                          </h4>
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                            {tech.group}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`w-2.5 h-2.5 rounded-full ${belt.colorClass} border ${belt.borderColorClass}`} />
                          <span className="text-[10px] font-bold text-slate-650">{tech.progress}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                Ações do Dojo
              </h2>
              
              <button
                onClick={onAddTechnique}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center block shadow-sm"
              >
                + Adicionar Nova Posição
              </button>

              <label className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm">
                <span>📥 Importar Backup (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
