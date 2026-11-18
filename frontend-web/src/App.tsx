import React, { useState, useEffect } from 'react';
import {
  fetchOverview,
  fetchSubscriptions,
  fetchAlerts,
  fetchCategories,
  fetchCancellationGuides,
  fetchExchangeRates,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  updateSubscriptionStatus,
  dismissAlert,
  triggerAlertScan,
  getCurrentUser,
  setCurrentUser,
  logoutUser
} from './api';
import {
  Subscription,
  AnalyticsOverview,
  NotificationLog,
  Category,
  CancellationGuide,
  UserSession
} from './types';
import { Navbar } from './components/Navbar';
import { AlertsBanner } from './components/AlertsBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { SubscriptionList } from './components/SubscriptionList';
import { PeriodAnalysisView } from './components/PeriodAnalysisView';
import { ProfitabilityView } from './components/ProfitabilityView';
import { CancellationGuidesModal } from './components/CancellationGuidesModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { UsdImpactModal } from './components/UsdImpactModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { Bell, ShieldCheck, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'period' | 'profitability' | 'alerts'>('dashboard');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [alerts, setAlerts] = useState<NotificationLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guides, setGuides] = useState<CancellationGuide[]>([]);
  const [dollarRate, setDollarRate] = useState<number>(3320.19);
  const [activeCurrency, setActiveCurrency] = useState<string>('COP');
  const [loading, setLoading] = useState(true);

  // Usuario y Sesión
  const [user, setUser] = useState<UserSession>(getCurrentUser());

  // Modo Oscuro / Claro
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('cazador_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modales
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isGuidesModalOpen, setIsGuidesModalOpen] = useState(false);
  const [isUsdModalOpen, setIsUsdModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedGuideSearch, setSelectedGuideSearch] = useState('');
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // Efecto para sincronizar el modo oscuro con el elemento HTML raíz
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cazador_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cazador_theme', 'light');
    }
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    loadAllData(activeCurrency);
  }, [user]);

  const loadAllData = async (curr?: string) => {
    const targetCurrency = curr || activeCurrency;
    setLoading(true);
    try {
      const [ovData, subsData, alertsData, catsData, guidesData, ratesData] = await Promise.all([
        fetchOverview(targetCurrency),
        fetchSubscriptions(),
        fetchAlerts(),
        fetchCategories(),
        fetchCancellationGuides(),
        fetchExchangeRates()
      ]);

      setOverview(ovData);
      setSubscriptions(subsData);
      setAlerts(alertsData);
      setCategories(catsData);
      setGuides(guidesData);

      const copRate = ratesData.find(r => r.targetCurrency === 'COP');
      if (copRate && copRate.rate) {
        setDollarRate(Number(copRate.rate));
      }
    } catch (err) {
      console.error('Error cargando datos del sistema:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyToggle = () => {
    const nextCurrency = activeCurrency === 'COP' ? 'USD' : 'COP';
    setActiveCurrency(nextCurrency);
    loadAllData(nextCurrency);
  };

  const handleOpenGuidesModal = (serviceName?: string) => {
    setSelectedGuideSearch(serviceName || '');
    setIsGuidesModalOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSubscriptionStatus(id, newStatus);
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar definitivamente esta suscripción?')) return;
    try {
      await deleteSubscription(id);
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSubscription = async (data: Partial<Subscription>) => {
    if (editingSubscription) {
      await updateSubscription(editingSubscription.id, data);
    } else {
      await createSubscription(data);
    }
    setEditingSubscription(null);
    await loadAllData();
  };

  const handleDismissAlert = async (id: string) => {
    try {
      await dismissAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleForceScan = async () => {
    try {
      await triggerAlertScan();
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsProfileModalOpen(false);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedUser: UserSession) => {
    setUser(loggedUser);
    setCurrentUser(loggedUser);
    setIsAuthModalOpen(false);
  };

  const pendingAlerts = alerts.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Barra de Navegación Principal */}
      <Navbar
        dollarRate={dollarRate}
        activeCurrency={activeCurrency}
        onCurrencyToggle={handleCurrencyToggle}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        pendingAlertsCount={pendingAlerts.length}
        user={user}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenUsdModal={() => setIsUsdModalOpen(true)}
        onOpenNewModal={() => {
          setEditingSubscription(null);
          setIsNewModalOpen(true);
        }}
        onOpenGuidesModal={() => handleOpenGuidesModal()}
        onOpenAlertsTab={() => setActiveTab('alerts')}
        activeTab={activeTab}
        setActiveTab={tab => setActiveTab(tab as any)}
      />

      {/* Contenido Dinámico */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Alertas 48h (Siempre visible en el Dashboard) */}
        <AlertsBanner
          alerts={alerts}
          onDismiss={handleDismissAlert}
          onOpenGuidesModal={() => handleOpenGuidesModal()}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
            <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
              Sincronizando con el servidor Spring Boot y Supabase...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <>
                <DashboardOverview overview={overview} currency={activeCurrency} dollarRate={dollarRate} />
                <SubscriptionList
                  subscriptions={subscriptions}
                  categories={categories}
                  currency={activeCurrency}
                  dollarRate={dollarRate}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onOpenGuidesModal={handleOpenGuidesModal}
                  onEdit={sub => {
                    setEditingSubscription(sub);
                    setIsNewModalOpen(true);
                  }}
                />
              </>
            )}

            {activeTab === 'period' && (
              <PeriodAnalysisView currency={activeCurrency} />
            )}

            {activeTab === 'profitability' && (
              <ProfitabilityView
                currency={activeCurrency}
                onOpenGuidesModal={handleOpenGuidesModal}
              />
            )}

            {activeTab === 'alerts' && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Historial de Alertas Pre-Cobro (48 Horas)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Notificaciones generadas para evitar cobros sorpresa o vencimientos de pruebas gratuitas
                    </p>
                  </div>
                  <button
                    onClick={handleForceScan}
                    className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Escanear 48h Ahora</span>
                  </button>
                </div>

                {alerts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                    <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">Sin alertas pendientes.</p>
                    <p className="text-slate-400 dark:text-slate-500">Tus suscripciones no tienen cobros programados en las próximas 48 horas.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map(a => (
                      <div
                        key={a.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-750/30 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-slate-900 dark:text-white">{a.title}</h5>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                a.status === 'pending'
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {a.status === 'pending' ? 'Activa' : 'Descartada'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{a.message}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block">
                            Programada para: {a.scheduledFor} • Servicio: {a.subscriptionName}
                          </span>
                        </div>

                        {a.status === 'pending' && (
                          <button
                            onClick={() => handleDismissAlert(a.id)}
                            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-xl transition shrink-0"
                          >
                            Descartar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modales */}
      <SubscriptionModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingSubscription(null);
        }}
        onSave={handleSaveSubscription}
        categories={categories}
        initialData={editingSubscription}
      />

      <CancellationGuidesModal
        isOpen={isGuidesModalOpen}
        onClose={() => setIsGuidesModalOpen(false)}
        guides={guides}
        initialSearch={selectedGuideSearch}
      />

      <UsdImpactModal
        isOpen={isUsdModalOpen}
        onClose={() => setIsUsdModalOpen(false)}
        dollarRate={dollarRate}
        subscriptions={subscriptions}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        subscriptions={subscriptions}
        currency={activeCurrency}
        dollarRate={dollarRate}
        onLogout={handleLogout}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Pie de Página */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">
        <p>Cazador de Gastos Hormiga • Gestor de Suscripciones y Cobros Recurrentes</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          Backend: Java 21 / Spring Boot 3 (IntelliJ IDEA) • Base de Datos: Supabase PostgreSQL • Despliegue: Render
        </p>
      </footer>
    </div>
  );
};

export default App;
