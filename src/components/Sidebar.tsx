import { useState, useMemo } from 'react';
import { DEFAULT_GROUPS } from '../types';
import type { Technique } from '../types';
import { getBeltForProgress } from '../utils/gym';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  Dumbbell
} from 'lucide-react';

interface SidebarProps {
  techniques: Technique[];
  selectedTab: 'dashboard' | 'calendar' | 'lesson';
  setSelectedTab: (tab: 'dashboard' | 'calendar' | 'lesson') => void;
  selectedTechnique: Technique | null;
  setSelectedTechnique: (technique: Technique | null) => void;
  onAddTechnique: () => void;
  onLogout: () => void;
  userEmail?: string | null;
}

export default function Sidebar({
  techniques,
  selectedTab,
  setSelectedTab,
  selectedTechnique,
  setSelectedTechnique,
  onAddTechnique,
  onLogout,
  userEmail
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (DEFAULT_GROUPS.length > 0) {
      initial[DEFAULT_GROUPS[0]] = true;
    }
    return initial;
  });

  // Filter actual techniques
  const actualTechniques = useMemo(() => {
    return techniques.filter((t) => t.description !== 'REGISTRO_TREINO');
  }, [techniques]);

  // Group techniques by category
  const techniquesByGroup = useMemo(() => {
    const groups: Record<string, Technique[]> = {};
    
    DEFAULT_GROUPS.forEach(g => {
      groups[g] = [];
    });

    actualTechniques.forEach(t => {
      if (t.group in groups) {
        groups[t.group].push(t);
      } else {
        if (!groups['Outros']) groups['Outros'] = [];
        groups['Outros'].push(t);
      }
    });

    // Remove empty groups unless they are in default groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0 && !DEFAULT_GROUPS.includes(key as any)) {
        delete groups[key];
      }
    });

    return groups;
  }, [actualTechniques]);

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Filtered techniques based on search query
  const filteredTechniquesByGroup = useMemo(() => {
    if (!searchQuery.trim()) return techniquesByGroup;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, Technique[]> = {};

    Object.entries(techniquesByGroup).forEach(([groupName, list]) => {
      const matches = list.filter(t => t.name.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query)));
      if (matches.length > 0) {
        filtered[groupName] = matches;
      }
    });

    return filtered;
  }, [techniquesByGroup, searchQuery]);

  return (
    <div className="w-80 h-screen bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 font-sans text-slate-700">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold uppercase tracking-wider text-slate-900 text-sm">
            Dojo Portal BJJ
          </span>
        </div>
      </div>

      {/* Main Navigation (Dashboard & Calendar) */}
      <div className="p-4 space-y-1.5 shrink-0">
        <button
          onClick={() => {
            setSelectedTab('dashboard');
            setSelectedTechnique(null);
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            selectedTab === 'dashboard'
              ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-blue-600" />
          <span>Painel Geral</span>
        </button>

        <button
          onClick={() => {
            setSelectedTab('calendar');
            setSelectedTechnique(null);
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            selectedTab === 'calendar'
              ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Frequência de Treinos</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 mb-2 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar posições..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm focus:ring-1 focus:ring-blue-400/20"
          />
        </div>
      </div>

      {/* Course Modules (Accordion list of techniques) */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 min-h-0 custom-scrollbar">
        <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1 mb-2">
          Módulos de Técnicas
        </div>
        
        {Object.keys(filteredTechniquesByGroup).length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Nenhuma posição encontrada.
          </div>
        ) : (
          Object.entries(filteredTechniquesByGroup).map(([groupName, list]) => {
            const isExpanded = expandedGroups[groupName];
            return (
              <div key={groupName} className="space-y-1">
                {/* Accordion Toggle */}
                <button
                  onClick={() => toggleGroup(groupName)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-100 transition-colors cursor-pointer group ${
                    isExpanded ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold truncate">
                    <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isExpanded ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">{groupName}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 font-bold">
                      {list.length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  )}
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="pl-3.5 space-y-0.5 border-l border-slate-200 ml-3.5 py-1">
                    {list.length === 0 ? (
                      <div className="text-[10px] text-slate-400 py-1 pl-2 italic">
                        Nenhuma técnica cadastrada
                      </div>
                    ) : (
                      list.map((tech) => {
                        const isSelected = selectedTechnique?.id === tech.id;
                        const belt = getBeltForProgress(tech.progress);
                        return (
                          <button
                            key={tech.id}
                            onClick={() => {
                              setSelectedTab('lesson');
                              setSelectedTechnique(tech);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all cursor-pointer group ${
                              isSelected
                                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100 shadow-sm'
                                : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                            }`}
                          >
                            <span className="truncate pr-2">{tech.name}</span>
                            
                            {/* Belt Rank Indicator dot */}
                            <div className="flex items-center gap-1 shrink-0">
                              {tech.testedInSparring && (
                                <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded border border-emerald-200 font-black">
                                  ROLA
                                </span>
                              )}
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${belt.colorClass} border ${belt.borderColorClass} shadow-sm shrink-0`}
                                title={`${belt.name} (${tech.progress}%)`}
                              />
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Actions (User details, Add technique button, Logout) */}
      <div className="p-4 border-t border-slate-200 space-y-3 shrink-0">
        <button
          onClick={onAddTechnique}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl active:scale-[0.98] transition-all cursor-pointer text-xs uppercase tracking-wider shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Posição</span>
        </button>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col min-w-0 max-w-[170px]">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
              Usuário ativo
            </span>
            <span className="text-xs font-bold text-slate-700 truncate" title={userEmail || ''}>
              {userEmail || 'bjj_student@gmail.com'}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
