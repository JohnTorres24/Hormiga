import React from 'react';
import { AlertTriangle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { NotificationLog } from '../types';

interface AlertsBannerProps {
  alerts: NotificationLog[];
  onDismiss: (id: string) => void;
  onOpenGuidesModal: () => void;
}

export const AlertsBanner: React.FC<AlertsBannerProps> = ({ alerts, onDismiss, onOpenGuidesModal }) => {
  const pendingAlerts = alerts.filter(a => a.status === 'pending');

  if (pendingAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {pendingAlerts.map(alert => {
        const isTrial = alert.notificationType === 'trial_ending';
        return (
          <div
            key={alert.id}
            className={`rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
              isTrial
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-start space-x-3.5">
              <div
                className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  isTrial
                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                }`}
              >
                {isTrial ? <Clock className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-sm tracking-tight">{alert.title}</h4>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isTrial
                        ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                        : 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                    }`}
                  >
                    48 horas pre-cobro
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-700 dark:text-slate-300 font-medium">
                  {alert.message}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
              <button
                onClick={onOpenGuidesModal}
                className="flex items-center space-x-1.5 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition"
              >
                <span>Ver Guía de Cancelación</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition"
                title="Descartar aviso"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
