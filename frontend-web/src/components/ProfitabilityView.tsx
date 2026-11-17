import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { fetchProfitability } from '../api';
import { ProfitabilityAnalysis } from '../types';

interface ProfitabilityViewProps {
  currency: string;
  onOpenGuidesModal: (serviceName?: string) => void;
}

export const ProfitabilityView: React.FC<ProfitabilityViewProps> = ({ currency, onOpenGuidesModal }) => {
  const [data, setData] = useState<ProfitabilityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchProfitability();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0';
    return `$${Number(amount).toLocaleString('es-CO')}`;
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Banner de Introducción */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold px-3 py-1 rounded-full mb-2">
              <Flame className="w-3.5 h-3.5" /> Algoritmo Cazador de Gastos Hormiga
            </div>
            <h3 className="text-xl font-black tracking-tight">Diagnóstico de Rentabilidad y Retorno de Valor</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium">
              Cruzamos el costo real anualizado, tu frecuencia de uso y la utilidad percibida (1 a 5) para identificar de inmediato qué servicios merecen renovarse y cuáles son fugas de dinero invisibles.
            </p>
          </div>

          {data && (
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-xl text-right shrink-0">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                Fuga Anual Identificada
              </span>
              <div className="text-2xl font-black text-white mt-0.5">
                {formatMoney(data.annualGhostExpenseTotal)} <span className="text-xs text-slate-300">{currency}</span>
              </div>
              <span className="text-[10px] text-slate-300">Ahorro inmediato si cancelas hoy</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold text-xs">Analizando rentabilidad...</div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bloque 1: Gastos Hormiga Críticos */}
          <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-900 text-sm">Gastos Hormiga Críticos</h4>
                  <p className="text-[11px] text-rose-600 font-medium">Bajo valor percibido (≤ 2) y uso casi nulo</p>
                </div>
              </div>
              <span className="text-xs font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                {data.ghostExpenses.length} detectadas
              </span>
            </div>

            {data.ghostExpenses.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">¡Excelente disciplina financiera!</p>
                <p className="text-slate-400">No tienes suscripciones clasificadas como gastos hormiga críticos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.ghostExpenses.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-xs text-rose-700 font-semibold mt-0.5">
                        Costo anual: {formatMoney(item.yearlyCostConverted)} {currency}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Uso: <span className="font-bold text-slate-700 capitalize">{item.usageFrequency}</span> • Calificación: {item.perceivedValue}/5
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenGuidesModal(item.provider)}
                      className="shrink-0 flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
                    >
                      <span>Cancelar con Guía</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bloque 2: Suscripciones Más Rentables */}
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Suscripciones Más Rentables</h4>
                  <p className="text-[11px] text-emerald-600 font-medium">Alto valor percibido (≥ 4) y uso frecuente</p>
                </div>
              </div>
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {data.mostProfitable.length} óptimas
              </span>
            </div>

            {data.mostProfitable.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No hay suscripciones marcadas con alta rentabilidad.</p>
            ) : (
              <div className="space-y-3">
                {data.mostProfitable.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {item.name}
                        <span className="text-[10px] font-black uppercase bg-emerald-200 text-emerald-900 px-2 py-0.2 rounded-full">
                          Indispensable
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        Costo anual: {formatMoney(item.yearlyCostConverted)} {currency}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Frecuencia: <span className="font-bold text-emerald-700 capitalize">{item.usageFrequency}</span> • Satisfacción: {item.perceivedValue}/5
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                      {item.perceivedValue}★
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
