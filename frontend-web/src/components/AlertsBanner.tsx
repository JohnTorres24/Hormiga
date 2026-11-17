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
            className={`rounded-xl border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
              isTrial
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg mt-0.5 ${
                  isTrial ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isTrial ? <Clock className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">{alert.title}</h4>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isTrial
                        ? 'bg-rose-200 text-rose-800'
                        : 'bg-amber-200 text-amber-800'
                    }`}
                  >
                    48 horas pre-cobro
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-700">{alert.message}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center">
              <button
                onClick={onOpenGuidesModal}
                className="flex items-center space-x-1 text-xs font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg shadow-2xs transition"
              >
                <span>Ver Guía de Cancelación</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md transition"
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
