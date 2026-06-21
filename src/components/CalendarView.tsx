import { useState } from 'react';
import type { Technique } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  CalendarCheck
} from 'lucide-react';

interface CalendarViewProps {
  techniques: Technique[];
  onAddTraining: (dateStr: string) => Promise<void>;
  onRemoveTraining: (id: string) => Promise<void>;
}

const MONTHS_BR = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAYS_BR = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function CalendarView({
  techniques,
  onAddTraining,
  onRemoveTraining
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();

  // Filter training documents
  const trainingDocs = techniques.filter((t) => t.description === 'REGISTRO_TREINO');
  const trainingDates = new Set(trainingDocs.map((t) => t.name)); // Set of "YYYY-MM-DD"

  // Calendar Math
  const firstDayIndex = new Date(currentYear, currentMonthIdx, 1).getDay();
  const numDaysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIdx - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIdx + 1, 1));
  };

  // Toggle training session
  const handleToggleDay = async (dayNum: number) => {
    const monthStr = String(currentMonthIdx + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    const formattedDate = `${dayStr}/${monthStr}/${currentYear}`;

    const match = trainingDocs.find((t) => t.name === dateStr);

    if (match) {
      const confirmRemove = window.confirm(`Deseja remover a presença de treino do dia ${formattedDate}?`);
      if (!confirmRemove) return;
    } else {
      const confirmAdd = window.confirm(`Deseja registrar presença de treino no dia ${formattedDate}?`);
      if (!confirmAdd) return;
    }

    if (isUpdating[dateStr]) return;
    setIsUpdating((prev) => ({ ...prev, [dateStr]: true }));

    try {
      if (match) {
        await onRemoveTraining(match.id);
      } else {
        await onAddTraining(dateStr);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar presença no Firestore.');
    } finally {
      setIsUpdating((prev) => ({ ...prev, [dateStr]: false }));
    }
  };

  // Stats Calculations
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;

  // Trainings this year
  const treinosAno = trainingDocs.filter((t) => {
    const parts = t.name.split('-');
    return parseInt(parts[0]) === todayYear;
  }).length;

  // Trainings this month
  const treinosMes = trainingDocs.filter((t) => {
    const parts = t.name.split('-');
    return parseInt(parts[0]) === todayYear && parseInt(parts[1]) === todayMonth;
  }).length;

  // Trainings this week
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const treinosSemana = trainingDocs.filter((t) => {
    try {
      const date = new Date(t.name + 'T12:00:00');
      return date >= startOfWeek && date <= endOfWeek;
    } catch {
      return false;
    }
  }).length;

  // Grid building
  const blanks = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: numDaysInMonth }, (_, i) => i + 1);
  const gridItems = [...blanks, ...days];

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-50 text-slate-800 p-6 flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
            Frequência
          </span>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          Calendário de Presença
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start flex-1 min-h-0">
        
        {/* Left Side: The Calendar Grid (8 cols) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
          
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-800">
              {MONTHS_BR[currentMonthIdx]} {currentYear}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
            {WEEKDAYS_BR.map((wd) => (
              <div key={wd} className="py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 flex-1">
            {gridItems.map((item, idx) => {
              if (item === null) {
                return <div key={`blank-${idx}`} className="aspect-square rounded-2xl bg-transparent" />;
              }

              const dayNum = item;
              const monthStr = String(currentMonthIdx + 1).padStart(2, '0');
              const dayStr = String(dayNum).padStart(2, '0');
              const cellDateStr = `${currentYear}-${monthStr}-${dayStr}`;
              const isTrained = trainingDates.has(cellDateStr);
              const updating = isUpdating[cellDateStr];
              
              const isToday =
                today.getDate() === dayNum &&
                today.getMonth() === currentMonthIdx &&
                today.getFullYear() === currentYear;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => handleToggleDay(dayNum)}
                  disabled={updating}
                  className={`aspect-square rounded-2xl border p-2 flex flex-col justify-between items-start transition-all active:scale-[0.96] group relative cursor-pointer ${
                    isTrained
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-700 hover:bg-emerald-100/50 shadow-sm'
                      : 'bg-slate-50/20 border-slate-200/60 hover:bg-slate-50 text-slate-700 shadow-sm'
                  } ${isToday ? 'ring-1 ring-blue-500 ring-offset-2 ring-offset-white' : ''}`}
                >
                  <span className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`}>
                    {dayNum}
                  </span>

                  {updating ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin self-end" />
                  ) : isTrained ? (
                    <div className="flex items-center gap-1 self-end text-emerald-600">
                      <CalendarCheck className="w-5 h-5 shrink-0" />
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-slate-200 self-end transition-colors" />
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Side: Training Stats panel (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Card: stats summary */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Métricas de Consistência
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Treinos na Semana</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">De Segunda a Domingo</p>
                  </div>
                </div>
                <span className="text-xl font-black text-slate-900">{treinosSemana}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Treinos no Mês</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Mês atual</p>
                  </div>
                </div>
                <span className="text-xl font-black text-slate-900">{treinosMes}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Treinos no Ano</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Ano de {todayYear}</p>
                  </div>
                </div>
                <span className="text-xl font-black text-slate-900">{treinosAno}</span>
              </div>
            </div>
          </div>

          {/* Quick tip box */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm text-slate-600 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-850">
              💡 Dica de Frequência
            </h3>
            <p className="text-xs leading-relaxed font-medium">
              Consistência vence talento no longo prazo. Manter o diário de presença atualizado ajuda a visualizar sua regularidade e correlacionar a frequência de treinos com a sua evolução técnica.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
