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
  Edit3
} from 'lucide-react';
import { Subscription, Category } from '../types';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  categories: Category[];
  currency: string;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  onOpenGuidesModal: (serviceName?: string) => void;
  onEdit: (sub: Subscription) => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  categories,
  currency,
  onStatusChange,
  onDelete,
  onOpenGuidesModal,
  onEdit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = subscriptions.filter(sub => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || sub.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || sub.categoryId === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0';
    return `$${Number(amount).toLocaleString('es-CO')}`;
  };

  const getDiagnosisBadge = (diagnosis?: string) => {
    switch (diagnosis) {
      case 'critico_gasto_hormiga':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> Gasto Hormiga Crítico
          </span>
        );
      case 'baja_rentabilidad':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Baja rentabilidad
          </span>
        );
      case 'alta_rentabilidad':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3 h-3" /> Alta rentabilidad
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            Moderada
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Mis Suscripciones</h3>
          <p className="text-xs text-slate-500 font-medium">Controla y audita el valor real de cada servicio recurrente</p>
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
              className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-52"
            />
          </div>

          {/* Filtro de Estado */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-transparent border-0 text-xs font-semibold text-slate-700 focus:ring-0 cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="trial">Pruebas gratuitas</option>
              <option value="paused">Pausadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          {/* Filtro de Categoría */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:ring-0 cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listado de Suscripciones */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No se encontraron suscripciones con los filtros actuales.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                <th className="pb-3 pl-2">Servicio</th>
                <th className="pb-3">Costo Original</th>
                <th className="pb-3">Impacto Anual</th>
                <th className="pb-3">Próximo Cobro</th>
                <th className="pb-3">Diagnóstico Rentabilidad</th>
                <th className="pb-3 text-right pr-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 transition">
                  <td className="py-4 pl-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-10 rounded-full"
                        style={{ backgroundColor: sub.categoryColor || '#6366f1' }}
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {sub.name}
                          {sub.isFreeTrial && (
                            <span className="text-[10px] font-black uppercase bg-violet-100 text-violet-700 px-2 py-0.2 rounded-full">
                              Prueba Gratuita
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                          <span>{sub.provider}</span>
                          <span>•</span>
                          <span>{sub.categoryName || 'General'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="font-extrabold text-slate-800">
                      {sub.currency} {Number(sub.price).toLocaleString('es-CO')}
                    </div>
                    <span className="text-xs text-slate-400 capitalize">Ciclo: {sub.billingCycle}</span>
                  </td>

                  <td className="py-4">
                    <div className="font-bold text-indigo-700">
                      {formatMoney(sub.normalizedYearlyCost)}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">al año ({currency})</span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center space-x-1.5 text-slate-700 text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sub.nextBillingDate}</span>
                    </div>
                    {sub.daysUntilNextBilling !== undefined && sub.daysUntilNextBilling !== null && (
                      <span
                        className={`text-[10px] font-bold ${
                          sub.daysUntilNextBilling <= 2
                            ? 'text-rose-600 font-extrabold'
                            : 'text-slate-400'
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
                    <div className="text-[11px] text-slate-400 mt-1">
                      Uso: <span className="font-semibold text-slate-600 capitalize">{sub.usageFrequency}</span> • Utilidad: {sub.perceivedValue}/5
                    </div>
                  </td>

                  <td className="py-4 pr-2 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* Enlace o Guía de Cancelación Rápida */}
                      <button
                        onClick={() => onOpenGuidesModal(sub.provider)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition"
                        title="Cómo cancelar este servicio sin rodeos"
                      >
                        <span>Cancelar</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Editar */}
                      <button
                        onClick={() => onEdit(sub)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition"
                        title="Editar suscripción"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Pausar o reanudar */}
                      {sub.status === 'active' ? (
                        <button
                          onClick={() => onStatusChange(sub.id, 'paused')}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md transition"
                          title="Pausar suscripción"
                        >
                          <PauseCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onStatusChange(sub.id, 'active')}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md transition"
                          title="Reanudar suscripción"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Eliminar */}
                      <button
                        onClick={() => onDelete(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition"
                        title="Eliminar suscripción"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
