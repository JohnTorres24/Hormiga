import React from 'react';
import { Calendar, DollarSign, PiggyBank, Flame, ArrowUpRight, Zap } from 'lucide-react';
import { AnalyticsOverview } from '../types';

interface DashboardOverviewProps {
  overview: AnalyticsOverview | null;
  currency: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ overview, currency }) => {
  if (!overview) return null;

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0';
    return `$${Number(amount).toLocaleString('es-CO')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Compromiso Mensual */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Costo Mensual Total</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {formatMoney(overview.totalMonthlyCommitment)} <span className="text-xs font-semibold text-slate-400">{currency}</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          Normalizado en tus {overview.totalActiveSubscriptions} suscripciones activas
        </p>
      </div>

      {/* 2. Impacto Anualizado Total */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Impacto Real Anualizado</span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-sky-700 tracking-tight">
          {formatMoney(overview.totalYearlyCommitment)} <span className="text-xs font-semibold text-sky-400">{currency}</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          «Tus {overview.totalActiveSubscriptions} suscripciones te cuestan {formatMoney(overview.totalYearlyCommitment)} al año»
        </p>
      </div>

      {/* 3. Cazador de Gastos Hormiga - Ahorro Potencial */}
      <div className="bg-linear-to-br from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between text-rose-800 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-600" /> Ahorro Anual Potencial
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-rose-700 tracking-tight">
          {formatMoney(overview.potentialAnnualSavings)} <span className="text-xs font-semibold text-rose-400">{currency}</span>
        </div>
        <p className="text-xs text-rose-800 mt-2 font-medium">
          Identificados {overview.totalGhostExpenses} gastos hormiga de uso casi nulo
        </p>
      </div>

      {/* 4. Suscripción de Mayor Valor */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Cobro Más Alto
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        {overview.highestExpense ? (
          <div>
            <div className="text-lg font-black text-slate-900 truncate">
              {overview.highestExpense.name}
            </div>
            <div className="text-sm font-bold text-amber-600 mt-0.5">
              {formatMoney(overview.highestExpense.normalizedMonthlyCost)} / mes
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              Proveedor: {overview.highestExpense.provider}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 mt-4">Sin registros de suscripciones</p>
        )}
      </div>
    </div>
  );
};
