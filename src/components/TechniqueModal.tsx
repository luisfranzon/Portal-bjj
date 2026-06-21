import { useState, useEffect } from 'react';
import { DEFAULT_GROUPS } from '../types';
import type { Technique } from '../types';
import { X, Save } from 'lucide-react';

interface TechniqueModalProps {
  technique: Technique | null; // Null means adding new
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    techniqueRaw: Omit<Technique, 'userId' | 'createdAt' | 'updatedAt'>,
    isEdit: boolean
  ) => Promise<void> | void;
}

export default function TechniqueModal({
  technique,
  isOpen,
  onClose,
  onSave
}: TechniqueModalProps) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState<string>(DEFAULT_GROUPS[0]);
  const [customGroup, setCustomGroup] = useState('');
  const [showCustomGroupInput, setShowCustomGroupInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [testedInSparring, setTestedInSparring] = useState(false);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when editing a technique
  useEffect(() => {
    if (technique) {
      setName(technique.name);
      
      const isDefaultGroup = DEFAULT_GROUPS.includes(technique.group as any);
      if (isDefaultGroup) {
        setGroup(technique.group);
        setShowCustomGroupInput(false);
      } else {
        setGroup('Outros');
        setCustomGroup(technique.group);
        setShowCustomGroupInput(true);
      }

      setVideoUrl(technique.videoUrl || '');
      setProgress(technique.progress);
      setTestedInSparring(technique.testedInSparring);
      setDescription(technique.description || '');
    } else {
      // Reset form for new technique
      setName('');
      setGroup(DEFAULT_GROUPS[0]);
      setCustomGroup('');
      setShowCustomGroupInput(false);
      setVideoUrl('');
      setProgress(0);
      setTestedInSparring(false);
      setDescription('');
    }
  }, [technique, isOpen]);

  if (!isOpen) return null;

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setGroup(value);
    if (value === 'Outros') {
      setShowCustomGroupInput(true);
    } else {
      setShowCustomGroupInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('O título da posição é obrigatório.');
      return;
    }

    setIsSaving(true);
    try {
      const finalGroup = showCustomGroupInput && customGroup.trim() ? customGroup.trim() : group;
      
      const rawItem: Omit<Technique, 'userId' | 'createdAt' | 'updatedAt'> = {
        id: technique ? technique.id : 'tech_' + Math.random().toString(36).substring(2, 15),
        name: name.trim(),
        group: finalGroup,
        videoUrl: videoUrl.trim(),
        progress: Number(progress),
        testedInSparring: Boolean(testedInSparring),
        description: description.trim(),
      };

      await onSave(rawItem, !!technique);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar no Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-slate-800">
      
      {/* Modal Card */}
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-150 flex items-center justify-between">
          <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
            {technique ? 'Editar Posição' : 'Adicionar Nova Posição'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Nome da Posição *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Armlock da Guarda Fechada, Passagem de Lapela..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
            />
          </div>

          {/* Category/Group */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Grupo / Módulo
            </label>
            <select
              value={group}
              onChange={handleGroupChange}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
            >
              {DEFAULT_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Group Input (conditional) */}
          {showCustomGroupInput && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                Nome do Grupo Personalizado *
              </label>
              <input
                type="text"
                required
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value)}
                placeholder="Ex: Meia-Guarda Profunda, Leglocks..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
              />
            </div>
          )}

          {/* YouTube Video URL */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Link de Vídeo (YouTube)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Ex: https://www.youtube.com/watch?v=..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
            />
            <p className="text-[10px] text-slate-500 font-semibold">
              Insira um link do YouTube para assistir ao vídeo diretamente da tela de cursos.
            </p>
          </div>

          {/* Progress Slider (Only if editing, or default to 0 for new) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                Nível de Maestria ({progress}%)
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-bold text-slate-450 px-0.5">
              <span>Branca (0%)</span>
              <span>Preta (100%)</span>
            </div>
          </div>

          {/* Sparring Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-800">Testado em Sparring (Rola)</span>
              <span className="text-[10px] text-slate-500 font-semibold">Já conseguiu aplicar esse golpe em treino prático?</span>
            </div>
            <input
              type="checkbox"
              checked={testedInSparring}
              onChange={(e) => setTestedInSparring(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded border-slate-350 bg-white focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Description / Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Detalhes / Notas Técnicas
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhes como pegadas, distribuição de peso, segredos de ajuste..."
              rows={4}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm resize-none leading-relaxed custom-scrollbar"
            />
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-150 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-600 transition-all cursor-pointer border border-slate-200 shadow-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Posição'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
