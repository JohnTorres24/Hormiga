import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface CancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionName: string;
}

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscriptionName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Dar de Baja «{subscriptionName}»
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            ¿Deseas confirmar la baja de este servicio? Al cancelarlo, dejará de cobrarse y el dinero protegido se sumará de forma permanente a tu perfil de ahorro.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
          >
            Volver
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm shadow-rose-200 dark:shadow-none"
          >
            Confirmar Cancelación
          </button>
        </div>
      </div>
    </div>
  );
};
