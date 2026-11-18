import React from 'react';
import { X, TrendingUp, TrendingDown, Globe } from 'lucide-react';
import { Subscription } from '../types';

interface UsdImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  dollarRate: number;
  subscriptions: Subscription[];
}

export const UsdImpactModal: React.FC<UsdImpactModalProps> = ({
  isOpen,
  onClose,
  dollarRate,
  subscriptions
}) => {
  if (!isOpen) return null;

  const trmFormatted = dollarRate.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formatCop = (amount: number) => {
    return `$${Math.round(amount).toLocaleString('es-CO')}`;
  };

  const formatUsd = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filtrar suscripciones dolarizadas activas
  const usdSubs = subscriptions.filter(
    s => s.currency.toUpperCase() === 'USD' && s.status === 'active'
  );

  const totalUsdMonthly = usdSubs.reduce(
    (acc, s) => acc + (s.normalizedMonthlyCost || s.price),
    0
  );
  const totalCopEquivalent = totalUsdMonthly * dollarRate;

  // Escenario al alza (+5%)
  const highRate = dollarRate * 1.05;
  const highMonthlyIncrease = totalUsdMonthly * (highRate - dollarRate);
  const highYearlyIncrease = highMonthlyIncrease * 12;

  // Escenario a la baja (-5%)
  const lowRate = dollarRate * 0.95;
  const lowMonthlySavings = totalUsdMonthly * (dollarRate - lowRate);
  const lowYearlySavings = lowMonthlySavings * 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              💵
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Impacto del Dólar (USD / TRM)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Sensibilidad cambiaria y riesgo en tus suscripciones en moneda extranjera
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta de TRM en Vivo */}
        <div className="mt-5 p-5 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Tasa Representativa del Mercado
            </span>
            <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              En Vivo
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-900 dark:text-emerald-200 tracking-tight mt-2">
            1 USD = ${trmFormatted} COP
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
            TRM Oficial en Vivo • open.er-api.com (Superintendencia Financiera)
          </p>
        </div>

        {/* Resumen de Suscripciones en Moneda Extranjera */}
        <div className="mt-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gasto Dolarizado Activo
            </span>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
              {usdSubs.length} servicio{usdSubs.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatUsd(totalUsdMonthly)} USD / mes
            </span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              ≈ {formatCop(totalCopEquivalent)} COP
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-600/60">
            {usdSubs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                No tienes suscripciones tasadas en USD actualmente. Cualquier nuevo servicio en dólares fluctuará según la TRM diaria.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Desglose de servicios expuestos al tipo de cambio:
                </p>
                {usdSubs.map(s => {
                  const subMonthly = s.normalizedMonthlyCost || s.price;
                  const inCop = subMonthly * dollarRate;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {s.name} ({s.provider})
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {formatUsd(subMonthly)} USD <span className="text-slate-400 font-normal">≈ {formatCop(inCop)} COP/mes</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas de Sensibilidad Cambiaria */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Simulador de Sensibilidad Cambiaria
          </h4>

          {/* Escenario 1: Alza +5% */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                Escenario Al Alza (+5%)
              </span>
              <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300">
                TRM: {formatCop(highRate)} COP
              </span>
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-300/90 mt-1 font-medium">
              {usdSubs.length === 0
                ? 'Si contratas un servicio de $10 USD, pagará +$1.660 COP adicionales al mes en este escenario.'
                : `Tus servicios dolarizados subirán +${formatCop(highMonthlyIncrease)} COP al mes (+${formatCop(highYearlyIncrease)} COP al año).`}
            </p>
          </div>

          {/* Escenario 2: Baja -5% */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                Escenario A La Baja (-5%)
              </span>
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                TRM: {formatCop(lowRate)} COP
              </span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-1 font-medium">
              {usdSubs.length === 0
                ? 'Una apreciación del peso reducirá el costo en moneda local de futuras suscripciones internacionales.'
                : `Ahorrarás -${formatCop(lowMonthlySavings)} COP al mes (-${formatCop(lowYearlySavings)} COP al año) en tus cobros recurrentes.`}
            </p>
          </div>
        </div>

        {/* Botón de Cierre */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs transition shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
