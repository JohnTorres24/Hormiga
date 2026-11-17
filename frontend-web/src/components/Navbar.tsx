import React from 'react';
import { ShieldAlert, DollarSign, Bell, Plus, BookOpen } from 'lucide-react';

interface NavbarProps {
  dollarRate: number;
  activeCurrency: string;
  onCurrencyToggle: () => void;
  pendingAlertsCount: number;
  onOpenNewModal: () => void;
  onOpenGuidesModal: () => void;
  onOpenAlertsTab: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  dollarRate,
  activeCurrency,
  onCurrencyToggle,
  pendingAlertsCount,
  onOpenNewModal,
  onOpenGuidesModal,
  onOpenAlertsTab,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                Cazador de Gastos Hormiga
                <span className="text-[10px] uppercase font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  IntelliJ + Supabase
                </span>
              </span>
              <p className="text-xs text-slate-500 font-medium">Gestor inteligente de suscripciones y cobros recurrentes</p>
            </div>
          </div>

          {/* Navegación y herramientas */}
          <div className="flex items-center space-x-3">
            {/* Tasa del Dólar en vivo */}
            <div
              onClick={onCurrencyToggle}
              title="Haz clic para alternar divisa de visualización"
              className="hidden md:flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>1 USD = ${dollarRate.toLocaleString('es-CO')} COP</span>
              <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded text-[10px]">
                {activeCurrency}
              </span>
            </div>

            {/* Guías de cancelación rápida */}
            <button
              onClick={onOpenGuidesModal}
              className="flex items-center space-x-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 px-3 py-2 rounded-lg text-xs font-semibold transition"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guías de Cancelación</span>
            </button>

            {/* Campana de alertas 48h */}
            <button
              onClick={onOpenAlertsTab}
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
              title="Alertas Pre-Cobro 48 horas"
            >
              <Bell className="w-5 h-5" />
              {pendingAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingAlertsCount}
                </span>
              )}
            </button>

            {/* Botón de nueva suscripción */}
            <button
              onClick={onOpenNewModal}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm shadow-indigo-200 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Suscripción</span>
            </button>
          </div>
        </div>

        {/* Pestañas de navegación principal */}
        <div className="flex space-x-6 -mb-px border-t border-slate-100 pt-1 text-sm font-semibold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Panel General
          </button>
          <button
            onClick={() => setActiveTab('period')}
            className={`py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'period'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Análisis Mes / Año
          </button>
          <button
            onClick={() => setActiveTab('profitability')}
            className={`py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'profitability'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Cazador de Gastos Hormiga & Rentabilidad
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Alertas 48h
            {pendingAlertsCount > 0 && (
              <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {pendingAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
