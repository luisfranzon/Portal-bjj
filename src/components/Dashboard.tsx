import { useMemo } from 'react';
import { DEFAULT_GROUPS } from '../types';
import type { Technique } from '../types';
import { getBeltForProgress } from '../utils/gym';
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
  onSelectTechnique: (tech: Technique) => void;
  onAddTechnique: () => void;
  onImportBackup: (items: any[]) => void;
  selectedModule: string | null;
  setSelectedModule: (module: string | null) => void;
  beltFilter: string;
  setBeltFilter: (belt: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  setSearchQuery
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
    <div className="flex-1 h-screen overflow-y-auto bg-slate-50 text-slate-800 p-6 flex flex-col gap-6 font-sans">
      
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
              { id: 'Faixa Preta', name: 'Preta', bg: 'bg-slate-900 hover:bg-slate-950 text-amber-400 border-slate-950 shadow-sm' },
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTechniques.map((tech) => {
                const belt = getBeltForProgress(tech.progress);
                return (
                  <button
                    key={tech.id}
                    onClick={() => onSelectTechnique(tech)}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left flex flex-col justify-between gap-4 transition-all active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider truncate">
                        {tech.group}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {tech.testedInSparring && (
                          <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Rola
                          </span>
                        )}
                        <div className={`w-2.5 h-2.5 rounded-full ${belt.colorClass} border ${belt.borderColorClass} shrink-0`} />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-1">
                        {tech.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 min-h-[2rem]">
                        {tech.description || 'Nenhuma anotação registrada ainda.'}
                      </p>
                    </div>

                    <div className="w-full space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-550 font-bold">
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
        /* RENDER MODE B: Drilldown Mode (Standard Navigation) */
        <>
          {/* Breadcrumbs or Back action if inside a module */}
          {selectedModule !== null && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 shrink-0">
              <button
                onClick={() => setSelectedModule(null)}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Painel Geral
              </button>
              <span>/</span>
              <span className="text-slate-800">{selectedModule}</span>
            </div>
          )}

          {/* Drilldown Step 2: Selected Module Details & Techniques Grid */}
          {selectedModule !== null ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
                  {selectedModule}
                </h2>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  ← Voltar para Módulos
                </button>
              </div>

              {filteredTechniques.filter(t => t.group === selectedModule || (selectedModule === 'Outros' && !DEFAULT_GROUPS.includes(t.group as any))).length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-slate-400 text-sm italic">
                  Nenhuma técnica cadastrada neste módulo no momento.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTechniques
                    .filter(t => t.group === selectedModule || (selectedModule === 'Outros' && !DEFAULT_GROUPS.includes(t.group as any)))
                    .map((tech) => {
                      const belt = getBeltForProgress(tech.progress);
                      return (
                        <button
                          key={tech.id}
                          onClick={() => onSelectTechnique(tech)}
                          className="p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left flex flex-col justify-between gap-4 transition-all active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer group"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider truncate">
                              {tech.group}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {tech.testedInSparring && (
                                <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  Rola
                                </span>
                              )}
                              <div className={`w-2.5 h-2.5 rounded-full ${belt.colorClass} border ${belt.borderColorClass} shrink-0`} />
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-1">
                              {tech.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2 min-h-[2rem]">
                              {tech.description || 'Nenhuma anotação registrada ainda.'}
                            </p>
                          </div>

                          <div className="w-full space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] text-slate-550 font-bold">
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
            /* Drilldown Step 1: Standard Dashboard Home (Stats + Mastery + Modules Grid) */
            <>
              {/* Grid: 3 Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                
                {/* Card 1: Total Techniques */}
                <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                      Total de Posições
                    </span>
                    <h3 className="text-3xl font-black text-slate-900">{total}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">Cadastradas no diário</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>

                {/* Card 2: Sparring Mastery */}
                <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                      Domínio de Rola
                    </span>
                    <h3 className="text-3xl font-black text-slate-900">{testedPercentage}%</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {testedCount} de {total} técnicas testadas
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>

                {/* Card 3: Attendance */}
                <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex items-center justify-between text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                      Treinos no Mês
                    </span>
                    <h3 className="text-3xl font-black text-slate-900">{treinosMes}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">Frequência registrada</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Main Sections: Belt Progress & Modules Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
                
                {/* Left Side: Belt Mastery and Module Library (8 cols) */}
                <div className="xl:col-span-8 space-y-6">
                  
                  {/* Belt Mastery Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>Nível de Maestria do Diário</span>
                    </h2>

                    <div className="space-y-3.5">
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
                          <div key={b.name} className="flex items-center justify-between gap-4">
                            <div className="w-32 flex items-center gap-2 shrink-0">
                              <div className={`w-3 h-3 rounded-full ${b.color} border ${b.border}`} />
                              <span className="text-xs font-bold text-slate-600">{b.name}</span>
                            </div>

                            <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60 relative">
                              <div
                                style={{ width: `${percentage}%` }}
                                className={`h-full ${b.color} transition-all duration-500`}
                              />
                            </div>

                            <div className="w-16 text-right shrink-0 flex items-center justify-end gap-1.5">
                              <span className="text-xs font-extrabold text-slate-800">{count}</span>
                              <span className="text-[10px] text-slate-400 font-bold">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modules Library (Grid of Categories) */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                      <span>Biblioteca de Módulos (Cursos)</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {DEFAULT_GROUPS.map((group) => {
                        const stats = categoryStats[group] || { total: 0, tested: 0 };
                        const percent = stats.total ? Math.round((stats.tested / stats.total) * 100) : 0;
                        const Icon = GROUP_ICONS[group] || HelpCircle;

                        return (
                          <button
                            key={group}
                            onClick={() => setSelectedModule(group)}
                            className="p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm hover:shadow-md text-left flex flex-col justify-between gap-4 group active:scale-[0.98] cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                <Icon className="w-5 h-5" />
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-650 group-hover:translate-x-0.5 transition-all" />
                            </div>

                            <div>
                              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                                {group}
                              </h3>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
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
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Side: Recent techniques & Actions (4 cols) */}
                <div className="xl:col-span-4 space-y-6">
                  
                  {/* Pausado em (Últimos Estudados) */}
                  <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Últimos Estudados</span>
                    </h2>

                    {recentTechniques.length === 0 ? (
                      <div className="text-center py-6 text-slate-450 text-xs italic">
                        Nenhuma técnica estudada recentemente.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {recentTechniques.map((tech) => {
                          const belt = getBeltForProgress(tech.progress);
                          return (
                            <button
                              key={tech.id}
                              onClick={() => onSelectTechnique(tech)}
                              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 text-left flex items-center justify-between gap-3 active:scale-[0.98] transition-all cursor-pointer group shadow-sm"
                            >
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate mb-0.5">
                                  {tech.name}
                                </h4>
                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                                  {tech.group}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className={`w-2.5 h-2.5 rounded-full ${belt.colorClass} border ${belt.borderColorClass}`} />
                                <span className="text-[10px] font-bold text-slate-600">{tech.progress}%</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions card */}
                  <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                      Ações do Dojo
                    </h2>
                    
                    <button
                      onClick={onAddTechnique}
                      className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/50 text-slate-650 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center block shadow-sm"
                    >
                      + Adicionar Nova Posição
                    </button>

                    <label className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/50 text-slate-650 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm">
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

              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
