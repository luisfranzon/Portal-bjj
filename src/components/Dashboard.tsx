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
  PlayCircle
} from 'lucide-react';

interface DashboardProps {
  techniques: Technique[];
  onSelectTechnique: (tech: Technique) => void;
  onAddTechnique: () => void;
  onSelectTab: (tab: 'dashboard' | 'calendar' | 'lesson') => void;
  onImportBackup: (items: any[]) => void;
}

export default function Dashboard({
  techniques,
  onSelectTechnique,
  onAddTechnique,
  onSelectTab,
  onImportBackup
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

  // Total techniques
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

  // Category counts and tested stats
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

  // Recent techniques (Last 4 updated)
  const recentTechniques = useMemo(() => {
    const sorted = [...actualTechniques].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return sorted.slice(0, 4);
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

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-50 text-slate-800 p-6 flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Trophy className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
            Resumo do Atleta
          </span>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          Painel Geral do Dojo
        </h1>
      </div>

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
        <button
          onClick={() => onSelectTab('calendar')}
          className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer group"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              Treinos no Mês
            </span>
            <h3 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{treinosMes}</h3>
            <p className="text-[10px] text-slate-500 font-semibold">Frequência registrada</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
            <Calendar className="w-6 h-6" />
          </div>
        </button>

      </div>

      {/* Main Sections: Belt Progress & Modules / Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Side: Belt Mastery system & Recent (8 cols) */}
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
                { name: 'Faixa Roxa', color: 'bg-purple-655', text: 'text-white', border: 'border-purple-700' },
                { name: 'Faixa Marrom', color: 'bg-amber-800', text: 'text-white', border: 'border-amber-900' },
                { name: 'Faixa Preta', color: 'bg-slate-900', text: 'text-amber-450', border: 'border-slate-950' },
              ].map((b) => {
                const count = beltDistribution[b.name as keyof typeof beltDistribution] || 0;
                const percentage = total ? Math.round((count / total) * 100) : 0;
                
                return (
                  <div key={b.name} className="flex items-center justify-between gap-4">
                    {/* Belt label */}
                    <div className="w-32 flex items-center gap-2 shrink-0">
                      <div className={`w-3 h-3 rounded-full ${b.color} border ${b.border}`} />
                      <span className="text-xs font-bold text-slate-600">{b.name}</span>
                    </div>

                    {/* Progress Bar container */}
                    <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60 relative">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full ${b.color} transition-all duration-500`}
                      />
                    </div>

                    {/* Count */}
                    <div className="w-16 text-right shrink-0 flex items-center justify-end gap-1.5">
                      <span className="text-xs font-extrabold text-slate-800">{count}</span>
                      <span className="text-[10px] text-slate-400 font-bold">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Posições (Continue watching style) */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Pausado em (Últimos Estudados)</span>
            </h2>

            {recentTechniques.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs italic">
                Nenhuma técnica adicionada recentemente. Cadastre uma nova para começar!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentTechniques.map((tech) => {
                  const belt = getBeltForProgress(tech.progress);
                  return (
                    <button
                      key={tech.id}
                      onClick={() => onSelectTechnique(tech)}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 text-left flex flex-col justify-between gap-3 active:scale-[0.98] transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider truncate">
                          {tech.group}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {tech.testedInSparring && (
                            <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                              Rola
                            </span>
                          )}
                          <div className={`w-2.5 h-2.5 rounded-full ${belt.colorClass} border ${belt.borderColorClass} shrink-0`} />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-blue-600 truncate mb-1 transition-colors">
                          {tech.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                          <span>Nível: {tech.progress}%</span>
                          <span>•</span>
                          <span>{belt.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold self-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Estudar Posição</span>
                        <PlayCircle className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Modules Breakdown (4 cols) */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            Módulos Cadastrados
          </h2>

          <div className="space-y-3 overflow-y-auto max-h-[480px] custom-scrollbar pr-1">
            {DEFAULT_GROUPS.map((group) => {
              const stats = categoryStats[group] || { total: 0, tested: 0 };
              const percent = stats.total ? Math.round((stats.tested / stats.total) * 100) : 0;
              
              return (
                <div key={group} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 truncate">{group}</span>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {stats.total} {stats.total === 1 ? 'posição' : 'posições'}
                    </span>
                  </div>

                  {stats.total > 0 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                        <span>Eficiência no Rola</span>
                        <span>{stats.tested} de {stats.total} ({percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">
                      Nenhuma posição adicionada
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={onAddTechnique}
            className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-slate-350 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/50 text-slate-500 hover:text-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center block"
          >
            + Adicionar Nova Posição
          </button>

          <label className="w-full py-2.5 rounded-xl border border-dashed border-slate-350 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/50 text-slate-500 hover:text-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-2 mt-2">
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
  );
}
