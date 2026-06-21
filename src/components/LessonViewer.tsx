import { useState, useEffect } from 'react';
import type { Technique } from '../types';
import { getBeltForProgress, getCleanVideoUrl } from '../utils/gym';
import {
  CheckSquare,
  Square,
  Video,
  Edit2,
  Trash2,
  ExternalLink,
  Save,
  HelpCircle,
  FileText,
  ChevronLeft
} from 'lucide-react';

interface LessonViewerProps {
  technique: Technique;
  onEdit: (technique: Technique) => void;
  onDelete: (id: string) => void | Promise<void>;
  onUpdateProgress: (id: string, progress: number) => void | Promise<void>;
  onToggleSparring: (id: string, current: boolean) => void | Promise<void>;
  onUpdateDescription: (id: string, notes: string) => void | Promise<void>;
  onBack: () => void;
}

export default function LessonViewer({
  technique,
  onEdit,
  onDelete,
  onUpdateProgress,
  onToggleSparring,
  onUpdateDescription,
  onBack
}: LessonViewerProps) {
  const [sliderValue, setSliderValue] = useState(technique.progress);
  const [notes, setNotes] = useState(technique.description || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [hasNotesChanged, setHasNotesChanged] = useState(false);

  // Sync state with prop updates
  useEffect(() => {
    setSliderValue(technique.progress);
  }, [technique.progress]);

  useEffect(() => {
    setNotes(technique.description || '');
    setHasNotesChanged(false);
  }, [technique.description]);

  const belt = getBeltForProgress(sliderValue);
  const videoDetails = getCleanVideoUrl(technique.videoUrl);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
  };

  const handleSliderCommit = () => {
    if (sliderValue !== technique.progress) {
      onUpdateProgress(technique.id, sliderValue);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onUpdateDescription(technique.id, notes);
      setHasNotesChanged(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setHasNotesChanged(true);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header Bar */}
      <div className="p-6 border-b border-slate-200 bg-white shadow-sm sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200 active:scale-95 transition-all cursor-pointer mr-1 shrink-0 flex items-center justify-center shadow-sm"
            title="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 tracking-wider">
                {technique.group}
              </span>
              {technique.testedInSparring && (
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 tracking-wider">
                  DOMINADO NO ROLA
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 truncate">
              {technique.name}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(technique)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => onDelete(technique.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Side: Video Player (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="w-full aspect-video bg-slate-200 rounded-3xl border border-slate-350 overflow-hidden shadow-md relative group flex flex-col justify-center items-center">
            {videoDetails && videoDetails.isYoutube && videoDetails.embedId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoDetails.embedId}?autoplay=0&rel=0`}
                title={technique.name}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoDetails ? (
              // External link player
              <div className="p-8 text-center max-w-sm">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 mx-auto text-blue-600 shadow-sm">
                  <Video className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">Vídeo Externo Detectado</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed font-semibold">
                  Este vídeo está em uma plataforma externa e não pode ser incorporado diretamente.
                </p>
                <a
                  href={videoDetails.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition-all shadow-md"
                >
                  <span>Abrir Vídeo Original</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              // Empty Video State
              <div className="p-8 text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 mx-auto text-slate-400 shadow-sm">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-2">Nenhum vídeo vinculado</h3>
                <p className="text-xs text-slate-550 mb-4 leading-relaxed">
                  Sem material de referência para esta posição no momento. Adicione um link do YouTube para assistir à técnica diretamente daqui.
                </p>
                <button
                  onClick={() => onEdit(technique)}
                  className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 font-semibold text-xs text-slate-700 border border-slate-200 transition-all shadow-sm"
                >
                  Adicionar Link de Vídeo
                </button>
              </div>
            )}
          </div>

          {/* Technique Notes */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Anotações de Treino
                </h2>
              </div>
              {hasNotesChanged && (
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  <Save className="w-3 h-3" />
                  <span>{isSavingNotes ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              )}
            </div>

            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Digite seus detalhes técnicos, ajustes da posição, segredos de pegada e observações..."
              className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-800 placeholder-slate-400 resize-none leading-relaxed focus:ring-0 custom-scrollbar min-h-[150px]"
            />
          </div>
        </div>

        {/* Right Side: Training Mastery & Sparring Check (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Sparring Test Card */}
          <button
            onClick={() => onToggleSparring(technique.id, technique.testedInSparring)}
            className={`p-6 rounded-3xl border text-left flex flex-col gap-3 group transition-all active:scale-[0.98] cursor-pointer shadow-sm ${
              technique.testedInSparring
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                Treino Prático (Rola)
              </span>
              {technique.testedInSparring ? (
                <CheckSquare className="w-6 h-6 text-emerald-600" />
              ) : (
                <Square className="w-6 h-6 text-slate-350 group-hover:text-slate-450" />
              )}
            </div>
            <div>
              <h3 className={`text-base font-bold mb-1 ${technique.testedInSparring ? 'text-slate-900' : 'text-slate-850'}`}>
                {technique.testedInSparring ? 'Aplicada em Sparring!' : 'Testar em Sparring'}
              </h3>
              <p className="text-xs text-slate-500 leading-normal font-medium">
                {technique.testedInSparring
                  ? 'Você já conseguiu aplicar essa posição com sucesso em um rola real. Excelente!'
                  : 'Depois de conseguir aplicar esse golpe durante o rola real, clique aqui para registrar.'}
              </p>
            </div>
          </button>

          {/* Mastery / Belt Level Card */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-5">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
                Nível de Maestria
              </span>
              <h3 className="text-base font-bold text-slate-850 mb-1">
                Graduação da Posição
              </h3>
              <p className="text-xs text-slate-500 leading-normal font-medium">
                Arraste o slider para atualizar sua proficiência técnica neste golpe específico.
              </p>
            </div>

            {/* Belt Rank Visual Component */}
            <div className={`p-4 rounded-2xl border flex flex-col items-center gap-3 relative overflow-hidden bg-slate-50 border-slate-200 shadow-inner`}>
              {/* Belt indicator stripe */}
              <div className="absolute top-0 left-0 right-0 h-1 flex">
                <div className={`flex-1 ${belt.colorClass} border-b ${belt.borderColorClass}`} />
              </div>

              <div className="flex flex-col items-center text-center mt-1">
                <span className="text-xs text-slate-400 font-semibold mb-0.5">Faixa Mapeada:</span>
                <span className="text-lg font-black uppercase text-slate-800 tracking-wide">{belt.name}</span>
                <span className="text-slate-600 font-mono text-sm mt-1 font-bold">{sliderValue}%</span>
              </div>
              
              <div className="text-[10px] text-slate-500 italic text-center leading-normal px-2">
                "{belt.description}"
              </div>
            </div>

            {/* Slider control */}
            <div className="space-y-2 mt-1">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                onMouseUp={handleSliderCommit}
                onTouchEnd={handleSliderCommit}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 px-0.5">
                <span>0% (Iniciante)</span>
                <span>100% (Mestre)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
