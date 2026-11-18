import React from 'react';
import { X, ShieldCheck, CheckCircle2, LogOut, Award } from 'lucide-react';
import { Subscription, UserSession } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession;
  subscriptions: Subscription[];
  currency: string;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  subscriptions,
  currency,
  onLogout
}) => {
  if (!isOpen) return null;

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'U';

  const formatMoney = (amount: number) => {
    return `$${Math.round(amount).toLocaleString('es-CO')} ${currency}`;
  };

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');

  const activeMonthlyTotal = activeSubs.reduce(
    (acc, s) => acc + (s.normalizedMonthlyCost || s.price),
    0
  );
  const cancelledMonthlySavings = cancelledSubs.reduce(
    (acc, s) => acc + (s.normalizedMonthlyCost || s.price),
    0
  );
  const cancelledYearlySavings = cancelledMonthlySavings * 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Cabecera del Perfil */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {user.fullName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {user.email}
              </p>
              <div className="mt-1 inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                <Award className="w-3 h-3" />
                <span>🎖️ Cazador de Gastos Hormiga</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta Destacada: Dinero Recuperado al Cancelar */}
        <div className="mt-5 p-5 rounded-2xl bg-linear-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Dinero Recuperado al Cancelar
              </span>
              <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                {cancelledSubs.length} neutralizada{cancelledSubs.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="text-3xl font-black tracking-tight mt-2 text-white">
              {formatMoney(cancelledMonthlySavings)}
              <span className="text-sm font-semibold text-indigo-300 ml-1">/ mes</span>
            </div>
            <p className="text-xs text-emerald-300 font-semibold mt-1">
              Ahorro anualizado protegido: {formatMoney(cancelledYearlySavings)} al año
            </p>
          </div>
        </div>

        {/* Balance de Suscripciones Activas vs Canceladas */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Activas */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Activas
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {activeSubs.length}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Gasto: {formatMoney(activeMonthlyTotal)}
            </p>
          </div>

          {/* Canceladas */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Canceladas
            </span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {cancelledSubs.length}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Gastos hormiga eliminados
            </p>
          </div>
        </div>

        {/* Historial de Cancelaciones y Ahorro */}
        <div className="mt-5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Historial de Gastos Hormiga Neutralizados
          </h4>

          {cancelledSubs.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
              <p className="font-semibold text-slate-600 dark:text-slate-300">Aún no has cancelado ninguna suscripción.</p>
              <p className="mt-1">
                Cuando des de baja un servicio o gasto hormiga, su ahorro mensual y anual se sumará de forma permanente aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cancelledSubs.map(sub => {
                const cost = sub.normalizedMonthlyCost || sub.price;
                return (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {sub.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sub.provider}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        +{formatMoney(cost)}/mes
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {formatMoney(cost * 12)}/año
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
