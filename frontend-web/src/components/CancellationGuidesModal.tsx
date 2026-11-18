import React, { useState } from 'react';
import { X, ExternalLink, ShieldAlert, Clock, Search } from 'lucide-react';
import { CancellationGuide } from '../types';

interface CancellationGuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  guides: CancellationGuide[];
  initialSearch?: string;
}

export const CancellationGuidesModal: React.FC<CancellationGuidesModalProps> = ({
  isOpen,
  onClose,
  guides,
  initialSearch = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedGuide, setSelectedGuide] = useState<CancellationGuide | null>(null);

  if (!isOpen) return null;

  const filteredGuides = guides.filter(g =>
    g.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeGuide = selectedGuide || filteredGuides[0] || null;

  let steps: Array<{ step: number; instruction: string }> = [];
  if (activeGuide && activeGuide.stepByStepInstructionsJson) {
    try {
      steps = JSON.parse(activeGuide.stepByStepInstructionsJson);
    } catch {
      steps = [];
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera del Modal */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Directorio de Cancelación Rápida</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Instrucciones directas y enlaces sin perder tiempo en menús ocultos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido en 2 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Panel Lateral: Lista de Servicios */}
          <div className="border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto bg-slate-50/70 dark:bg-slate-950/60">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar plataforma..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              {filteredGuides.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGuide(g)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    activeGuide?.id === g.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{g.serviceName}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${
                      activeGuide?.id === g.id
                        ? 'bg-indigo-700 text-white'
                        : g.difficultyLevel === 'hard'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {g.difficultyLevel === 'easy' ? 'Fácil' : g.difficultyLevel === 'medium' ? 'Media' : 'Difícil'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Panel Principal: Detalle de la Guía */}
          <div className="md:col-span-2 p-6 overflow-y-auto space-y-6 bg-white dark:bg-slate-900">
            {activeGuide ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">{activeGuide.serviceName}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Tiempo estimado: ~{activeGuide.estimatedTimeMinutes} min
                      </span>
                    </div>
                  </div>

                  {/* Botón de Enlace Directo a Cancelación */}
                  <a
                    href={activeGuide.directCancellationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm shadow-rose-500/20 transition"
                  >
                    <span>Ir a Cancelar Ahora</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Advertencia sobre trampas de retención (Dark Patterns) */}
                {activeGuide.cancellationTrapsWarning && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200">
                    <div className="font-extrabold flex items-center gap-1.5 text-amber-800 dark:text-amber-300 mb-1">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Advertencia de Patrón Oscuro / Retención:
                    </div>
                    <p className="text-amber-800/90 dark:text-amber-100 leading-relaxed font-medium">
                      {activeGuide.cancellationTrapsWarning}
                    </p>
                  </div>
                )}

                {/* Paso a Paso */}
                <div>
                  <h5 className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-3">
                    Instrucciones Paso a Paso
                  </h5>
                  <div className="space-y-3">
                    {steps.map((st, i) => (
                      <div key={i} className="flex items-start space-x-3 bg-slate-100/80 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          {st.step}
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-100 font-semibold leading-relaxed pt-0.5">
                          {st.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-12 text-center">Selecciona un servicio para ver su guía.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
