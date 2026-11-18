import React, { useState } from 'react';
import {
  ExternalLink,
  Trash2,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  Search,
  Filter,
  Edit3,
  ShieldBan,
  CheckCircle2
} from 'lucide-react';
import { Subscription, Category } from '../types';
import { CancelConfirmModal } from './CancelConfirmModal';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  categories: Category[];
  currency: string;
  dollarRate?: number;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onOpenGuidesModal: (serviceName?: string) => void;
  onEdit: (sub: Subscription) => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  categories,
  currency,
  dollarRate = 3320.19,
  onStatusChange,
  onDelete,
  onOpenGuidesModal,
  onEdit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [subToCancel, setSubToCancel] = useState<Subscription | null>(null);

  const rate = dollarRate > 0 ? dollarRate : 3320.19;

  const filtered = subscriptions.filter(sub => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || sub.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || sub.categoryId === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatMoney = (amount: number, targetCurrency: string) => {
    if (targetCurrency === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${Math.round(amount).toLocaleString('es-CO')}`;
  };

  const getConvertedPrice = (price: number, subCurrency: string, targetCurrency: string) => {
    const subCurr = (subCurrency || 'COP').toUpperCase();
    const tgtCurr = targetCurrency.toUpperCase();
    if (subCurr === tgtCurr) {
      return formatMoney(price, tgtCurr);
    }
    if (subCurr === 'USD' && tgtCurr === 'COP') {
      return formatMoney(price * rate, 'COP');
    }
    if (subCurr === 'COP' && tgtCurr === 'USD') {
      return formatMoney(price / rate, 'USD');
    }
    return formatMoney(price, tgtCurr);
  };

  const getYearlyCost = (sub: Subscription, targetCurrency: string) => {
    const baseYearly = sub.normalizedYearlyCost || sub.price * 12;
    const subCurr = (sub.currency || 'COP').toUpperCase();
    const tgtCurr = targetCurrency.toUpperCase();
    if (subCurr === tgtCurr) {
      return formatMoney(baseYearly, tgtCurr);
    }
    if (subCurr === 'USD' && tgtCurr === 'COP') {
      return formatMoney(baseYearly * rate, 'COP');
    }
    if (subCurr === 'COP' && tgtCurr === 'USD') {
      return formatMoney(baseYearly / rate, 'USD');
    }
    return formatMoney(baseYearly, tgtCurr);
  };

  const getDiagnosisBadge = (diagnosis?: string) => {
    switch (diagnosis) {
      case 'critico_gasto_hormiga':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" /> Gasto Hormiga Crítico
          </span>
        );
      case 'baja_rentabilidad':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
            Baja rentabilidad
          </span>
        );
      case 'alta_rentabilidad':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
            <Sparkles className="w-3 h-3" /> Alta rentabilidad
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            Moderada
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 sm:p-6 mb-6 transition-colors duration-200">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Mis Suscripciones
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
            Controla, audita el valor real y neutraliza gastos hormiga
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Campo de búsqueda */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar servicio o proveedor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-52"
            />
          </div>

          {/* Filtro de Estado */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-transparent border-0 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Todos los estados</option>
              <option value="active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Activas</option>
              <option value="trial" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pruebas gratuitas</option>
              <option value="paused" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pausadas</option>
              <option value="cancelled" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Canceladas (Ahorro)</option>
            </select>
          </div>

          {/* Filtro de Categoría */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:ring-0 cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listado de Suscripciones */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
          <AlertCircle className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No se encontraron suscripciones con los filtros actuales.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-black uppercase text-slate-600 dark:text-slate-200 tracking-wider">
                <th className="pb-3 pl-2">Servicio</th>
                <th className="pb-3">Costo</th>
                <th className="pb-3">Impacto Anual ({currency})</th>
                <th className="pb-3">Próximo Cobro</th>
                <th className="pb-3">Diagnóstico Rentabilidad</th>
                <th className="pb-3 text-right pr-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filtered.map(sub => {
                const isCancelled = sub.status === 'cancelled';
                const isPaused = sub.status === 'paused';

                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/40 transition ${
                      isCancelled ? 'opacity-65' : ''
                    }`}
                  >
                    <td className="py-4 pl-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-2.5 h-10 rounded-full shrink-0"
                          style={{ backgroundColor: sub.categoryColor || '#6366f1' }}
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                            <span className={isCancelled ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                              {sub.name}
                            </span>
                            {sub.isFreeTrial && (
                              <span className="text-[10px] font-black uppercase bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 px-2 py-0.2 rounded-full border border-violet-200 dark:border-violet-800">
                                Prueba Gratuita
                              </span>
                            )}
                            {isCancelled && (
                              <span className="text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.2 rounded-full flex items-center gap-0.5 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3" /> Ahorro Protegido
                              </span>
                            )}
                            {isPaused && (
                              <span className="text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.2 rounded-full border border-amber-200 dark:border-amber-800">
                                Pausada
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-300 font-medium flex items-center gap-2 mt-0.5">
                            <span>{sub.provider}</span>
                            <span>•</span>
                            <span>{sub.categoryName || 'General'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {sub.currency} {Number(sub.price).toLocaleString('es-CO')}
                      </div>
                      {sub.currency.toUpperCase() !== currency.toUpperCase() && (
                        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          ≈ {getConvertedPrice(sub.price, sub.currency, currency)} {currency}
                        </div>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-300 capitalize block mt-0.5">
                        Ciclo: {sub.billingCycle}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">
                        {getYearlyCost(sub, currency)}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">
                        al año ({currency})
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-100 text-xs font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
                        <span>{isCancelled ? 'Cancelada' : sub.nextBillingDate}</span>
                      </div>
                      {!isCancelled && sub.daysUntilNextBilling !== undefined && sub.daysUntilNextBilling !== null && (
                        <span
                          className={`text-[10px] block mt-0.5 font-bold ${
                            sub.daysUntilNextBilling <= 2
                              ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                              : 'text-slate-500 dark:text-slate-300'
                          }`}
                        >
                          {sub.daysUntilNextBilling <= 0
                            ? '¡Cobro HOY!'
                            : sub.daysUntilNextBilling === 1
                            ? 'Mañana (48h)'
                            : `En ${sub.daysUntilNextBilling} días`}
                        </span>
                      )}
                    </td>

                    <td className="py-4">
                      {getDiagnosisBadge(sub.profitabilityDiagnosis)}
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        Uso: <span className="font-bold text-slate-900 dark:text-white capitalize">{sub.usageFrequency}</span> • Utilidad: <span className="font-bold text-slate-900 dark:text-white">{sub.perceivedValue}/5</span>
                      </div>
                    </td>

                    <td className="py-4 pr-2 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Botón Acción Rápida: Dar de baja */}
                        {!isCancelled ? (
                          <button
                            onClick={() => setSubToCancel(sub)}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1.5 rounded-xl transition"
                            title="Dar de baja este servicio y sumar su ahorro al perfil"
                          >
                            <ShieldBan className="w-3.5 h-3.5" />
                            <span>Dar de Baja</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onStatusChange(sub.id, 'active')}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-xl transition"
                            title="Reactivar suscripción"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Reactivar</span>
                          </button>
                        )}

                        {/* Guía de Cancelación */}
                        <button
                          onClick={() => onOpenGuidesModal(sub.provider)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          title="Ver guía paso a paso para cancelar en el proveedor oficial"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => onEdit(sub)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          title="Editar datos de suscripción"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Pausar o reanudar */}
                        {!isCancelled && (
                          sub.status === 'active' ? (
                            <button
                              onClick={() => onStatusChange(sub.id, 'paused')}
                              className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                              title="Pausar suscripción"
                            >
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onStatusChange(sub.id, 'active')}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                              title="Reanudar suscripción"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          )
                        )}

                        {/* Eliminar permanentemente */}
                        <button
                          onClick={() => onDelete(sub.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          title="Eliminar suscripción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación para dar de baja */}
      <CancelConfirmModal
        isOpen={!!subToCancel}
        onClose={() => setSubToCancel(null)}
        subscriptionName={subToCancel?.name || ''}
        onConfirm={() => {
          if (subToCancel) {
            onStatusChange(subToCancel.id, 'cancelled');
            setSubToCancel(null);
          }
        }}
      />
    </div>
  );
};
