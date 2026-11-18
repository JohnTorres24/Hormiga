import React, { useState, useEffect } from 'react';
import { Calendar, PieChart } from 'lucide-react';
import { fetchPeriodAnalysis } from '../api';
import { PeriodAnalysis } from '../types';

interface PeriodAnalysisViewProps {
  currency: string;
}

export const PeriodAnalysisView: React.FC<PeriodAnalysisViewProps> = ({ currency }) => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [analysis, setAnalysis] = useState<PeriodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [year, month]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPeriodAnalysis(year, month);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6 mb-8 transition-colors duration-200">
      {/* Selector de Periodo */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Análisis Financiero por Mes y Año
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Audita la distribución de cobros día por día y por categoría
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {monthNames.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold text-xs">Cargando métricas...</div>
      ) : analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda / Central: Desglose Día por Día */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Calendario de Débitos en {monthNames[month - 1]} {year}
              </h4>
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl">
                Total Mes: ${analysis.totalAmount.toLocaleString('es-CO')} {currency}
              </span>
            </div>

            {analysis.chargesByDay.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No hay cobros previstos para este periodo.</p>
            ) : (
              <div className="space-y-3">
                {analysis.chargesByDay.map((charge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-750/30 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase leading-none">Día</span>
                        <span className="text-base font-black text-indigo-600 dark:text-indigo-400 leading-none mt-0.5">{charge.day}</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{charge.subscriptionName}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                          {charge.categoryName} • Monto original: {charge.currency} {Number(charge.amount).toLocaleString('es-CO')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        ${Number(charge.convertedAmount).toLocaleString('es-CO')}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">{currency}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Desglose por Categoría */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Gasto por Categoría
            </h4>

            {analysis.categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">Sin datos de categorías.</p>
            ) : (
              <div className="space-y-4">
                {analysis.categoryBreakdown.map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: cat.categoryColor }}
                        />
                        {cat.categoryName}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        ${Number(cat.totalAmount).toLocaleString('es-CO')} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.categoryColor
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
