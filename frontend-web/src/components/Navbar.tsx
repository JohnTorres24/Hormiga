import React from 'react';
import { DollarSign, Bell, Plus, BookOpen, Sun, Moon } from 'lucide-react';
import { AntLogo } from './AntLogo';
import { UserSession } from '../types';

interface NavbarProps {
  dollarRate: number;
  activeCurrency: string;
  onCurrencyToggle: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  pendingAlertsCount: number;
  user: UserSession;
  onOpenProfileModal: () => void;
  onOpenUsdModal: () => void;
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
  isDarkMode,
  onThemeToggle,
  pendingAlertsCount,
  user,
  onOpenProfileModal,
  onOpenUsdModal,
  onOpenNewModal,
  onOpenGuidesModal,
  onOpenAlertsTab,
  activeTab,
  setActiveTab
}) => {
  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'U';

  const trmFormatted = dollarRate.toLocaleString('es-CO', {
    maximumFractionDigits: 0
  });

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título con Isotipo Oficial de la Hormiga */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <AntLogo className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Cazador de Gastos Hormiga
                <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  IntelliJ + Supabase
                </span>
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:block">
                Gestor inteligente de suscripciones y cobros recurrentes
              </p>
            </div>
          </div>

          {/* Navegación y herramientas */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Botón USD: Impacto del Dólar y TRM en vivo */}
            <button
              onClick={onOpenUsdModal}
              title="Ver análisis de impacto de la TRM del dólar en tus suscripciones"
              className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">USD: ${trmFormatted}</span>
              <span className="sm:hidden">USD</span>
              <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded text-[10px] font-extrabold">
                TRM
              </span>
            </button>

            {/* Alternar Moneda Global (COP / USD) */}
            <button
              onClick={onCurrencyToggle}
              title={`Moneda de visualización activa: ${activeCurrency}. Haz clic para cambiar a ${activeCurrency === 'COP' ? 'USD' : 'COP'}.`}
              className="hidden lg:flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <span>{activeCurrency === 'USD' ? '💵 USD' : '💰 COP'}</span>
            </button>

            {/* Botón Conmutador Modo Oscuro / Modo Claro */}
            <button
              onClick={onThemeToggle}
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Guías de cancelación rápida */}
            <button
              onClick={onOpenGuidesModal}
              title="Guías paso a paso para cancelar servicios"
              className="hidden md:flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-xl text-xs font-semibold transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Guías</span>
            </button>

            {/* Campana de alertas 48h */}
            <button
              onClick={onOpenAlertsTab}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Alertas Pre-Cobro 48 horas"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {pendingAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingAlertsCount}
                </span>
              )}
            </button>

            {/* Perfil de Usuario con Ahorro Acumulado */}
            <button
              onClick={onOpenProfileModal}
              title="Ver perfil de usuario y dinero recuperado por cancelaciones"
              className="flex items-center space-x-2 pl-1 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                {initials}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden md:inline truncate max-w-28">
                {user.fullName.split(' ')[0]}
              </span>
            </button>

            {/* Botón de nueva suscripción */}
            <button
              onClick={onOpenNewModal}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Suscripción</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>
        </div>

        {/* Pestañas de navegación principal */}
        <div className="flex space-x-6 -mb-px border-t border-slate-100 dark:border-slate-800 pt-1 text-sm font-semibold text-slate-600 dark:text-slate-400 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2.5 border-b-2 transition whitespace-nowrap text-xs sm:text-sm font-bold ${
              activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
            }`}
          >
            Panel General
          </button>
          <button
            onClick={() => setActiveTab('period')}
            className={`py-2.5 border-b-2 transition whitespace-nowrap text-xs sm:text-sm font-bold ${
              activeTab === 'period'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
            }`}
          >
            Análisis Mes / Año
          </button>
          <button
            onClick={() => setActiveTab('profitability')}
            className={`py-2.5 border-b-2 transition whitespace-nowrap text-xs sm:text-sm font-bold ${
              activeTab === 'profitability'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
            }`}
          >
            Cazador de Gastos Hormiga & Rentabilidad
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
              activeTab === 'alerts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
            }`}
          >
            Alertas 48h
            {pendingAlertsCount > 0 && (
              <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {pendingAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
