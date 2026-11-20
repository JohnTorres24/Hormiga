import React from 'react';
import {
  Download,
  ArrowRight,
  ShieldAlert,
  Bell,
  DollarSign,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  Award,
  Sun,
  Moon
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  isDarkMode,
  onToggleTheme
}) => {
  const apkDownloadUrl =
    'https://github.com/JohnTorres24/Hormiga/raw/main/release/cazador-gastos-hormiga-v1.0.apk';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      {/* 1. Barra de Navegación de la Portada */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <span className="text-xl">🐜</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Cazador de Gastos Hormiga
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Defensa Financiera contra Fugas de Capital
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Alternador de Tema */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Botón Descargar APK */}
            <a
              href={apkDownloadUrl}
              className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar APK</span>
            </a>

            {/* Botón Entrar al Dashboard */}
            <button
              onClick={onEnterApp}
              className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              <span>Abrir Web App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Sección Hero Principal */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Resplandor decorativo de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Texto y Llamadas a la Acción */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gestor de Suscripciones & Auditoría Automatizada</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
                Detén la fuga silenciosa de tu dinero.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 dark:from-indigo-400 dark:via-cyan-400 dark:to-emerald-400">
                  Caza tus gastos hormiga.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                El usuario promedio pierde hasta <strong>$796.000 COP al año</strong> en suscripciones olvidadas, pruebas gratuitas no canceladas a tiempo y cobros periódicos invisibles. Esta plataforma audita tu rentabilidad, te alerta 48 horas antes de cada cargo y neutraliza trampas de retención.
              </p>

              {/* Botones Primarios de Descarga y Acceso */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href={apkDownloadUrl}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <span className="text-[10px] block opacity-80 leading-none font-semibold">Instalador Móvil</span>
                    <span className="leading-tight">Descargar APK para Android</span>
                  </div>
                </a>

                <button
                  onClick={onEnterApp}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm shadow-xl shadow-slate-900/10 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Probar en el Navegador</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Métricas Rápidas de Confianza */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">48 Horas</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Alertas Pre-Cobro</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ahorro Protegido</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">TRM en Vivo</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sensibilidad Cambiaria</div>
                </div>
              </div>
            </div>

            {/* Maqueta Visual del Teléfono Móvil y Tarjetas en Vivo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Marco de Dispositivo Móvil */}
                <div className="relative mx-auto border-8 border-slate-850 dark:border-slate-800 bg-slate-900 rounded-[44px] shadow-2xl overflow-hidden aspect-[9/19] max-h-[580px] flex flex-col">
                  {/* Isla Dinámica / Altavoz */}
                  <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mt-2 shrink-0" />

                  {/* Pantalla Simulada con Datos Reales */}
                  <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
                    {/* Header App Móvil */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                          JT
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-white leading-none">¡Hola, Jhonatan!</p>
                          <p className="text-[9px] text-slate-400">2 suscripciones</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                        💰 COP Activo
                      </span>
                    </div>

                    {/* Tarjeta Hero Neobanco */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-950 text-white space-y-1 shadow-md">
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-200">
                        Compromiso Mensual Total
                      </p>
                      <p className="text-2xl font-black tracking-tight text-white">$ 66.371 COP</p>
                      <p className="text-[10px] text-indigo-300 font-medium">Impacto anual: $ 796.446 COP/año</p>
                    </div>

                    {/* Tarjeta de Ahorro Recuperado */}
                    <div className="p-3 rounded-2xl bg-slate-850 border border-emerald-500/30 text-white space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Dinero Recuperado
                        </span>
                        <span className="text-[8px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                          1 Neutralizada
                        </span>
                      </div>
                      <p className="text-lg font-black text-emerald-300">$23.79 USD / mes</p>
                      <p className="text-[9px] text-slate-300">Ahorro protegido: $285.53 USD al año</p>
                    </div>

                    {/* Lista de Suscripciones Móvil */}
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Suscripciones Activas
                      </p>
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Spotify Familiar</p>
                          <p className="text-[9px] text-slate-400">Cobro en 30 días</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-indigo-400">$19.99 USD</p>
                          <span className="text-[8px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded-md font-bold">
                            Rentable
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-rose-500/30 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-300">Gimnasio Olvidado</p>
                          <p className="text-[9px] text-rose-400 font-medium">Fuga Erradicada</p>
                        </div>
                        <span className="text-[9px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded-md font-bold">
                          Cancelado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge Flotante */}
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl p-3 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    🛡️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Alerta Preventiva 48h</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Evita renovaciones silenciosas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sección Conceptual: ¿Qué es un Gasto Hormiga Digital? */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              El Problema Oculto
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Los cobros automáticos que desangran tu presupuesto
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              A diferencia de las compras grandes y conscientes, las suscripciones se camuflan bajo cargos periódicos de bajo valor aparente. El resultado es una fuga constante e inadvertida de dinero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-xl">
                ⚠️
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Pruebas Gratuitas que Expiran</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Empiezas un <em>free trial</em> de 7 o 14 días con tarjeta de crédito, olvidas cancelarlo y el servicio se renueva silenciosamente por meses o años completos.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xl">
                📉
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Suscripciones en Dólares (Riesgo TRM)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Herramientas de IA, streaming o almacenamiento facturadas en USD. Si el dólar sube, tu tarifa en pesos colombianos se incrementa sin que te des cuenta.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xl">
                🔒
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Patrones Oscuros de Retención</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Las empresas ocultan el botón de cancelación detrás de 5 páginas de confirmación, preguntas redundantes y amenazas de pérdida de beneficios para forzar tu permanencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sección de Características Clave */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Cinco Pilares de Defensa Financiera
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Todo lo que necesitas para recuperar el control
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pilar 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Diagnóstico de Rentabilidad</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Cruza la frecuencia de uso declarada con tu calificación de utilidad percibida (1★ a 5★) para clasificar cada servicio en <em>Gasto Hormiga Crítico</em>, <em>Uso Moderado</em> o <em>Alta Rentabilidad</em>.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Alertas Pre-Cobro de 48 Horas</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Recibe avisos dos días antes de cada fecha de cobro para decidir con tiempo suficiente si mantienes la suscripción o la cancelas antes de que impacte tu saldo.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Conmutador COP / USD y TRM</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Alterna las cifras instantáneamente entre pesos y dólares. Nuestro simulador calcula la sensibilidad si la TRM sube o baja un 5%, proyectando el impacto a 12 meses.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Perfil con Dinero Recuperado</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Al cancelar un servicio innecesario, el dinero que dejas de gastar se suma a tu perfil de ahorro mensual y anualizado como un trofeo de disciplina financiera.
              </p>
            </div>

            {/* Pilar 5 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Directorio contra Patrones Oscuros</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Instrucciones paso a paso y enlaces directos a las páginas oficiales de baja de Netflix, Apple, Spotify, Amazon y Adobe, sorteando menús ocultos.
              </p>
            </div>

            {/* Pilar 6 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Arquitectura Robusta y Multiplataforma</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Backend en Java 21 y Spring Boot 3 con base de datos PostgreSQL sobre Supabase, aplicación nativa Android en Kotlin y frontend en React 18 con Vite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Sección de Llamado Final a la Descarga */}
      <section className="py-16 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold text-indigo-300">
            <span>Disponible Gratis para Android y Web</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Comienza a proteger tu dinero hoy mismo
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Descarga el instalador APK en tu celular o accede directamente desde cualquier navegador para auditar tus servicios en menos de dos minutos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={apkDownloadUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-2xl shadow-emerald-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download className="w-5 h-5 text-slate-950" />
              <span>Descargar APK para Android (v1.0.0)</span>
            </a>

            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-sm backdrop-blur-xs transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Ingresar a la Web App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Compatible con Android 8.0+
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Paquete ligero (~7.5 MB)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sincronización en la Nube
            </span>
          </div>
        </div>
      </section>

      {/* 6. Pie de Página */}
      <footer className="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-center sm:text-left">
            <strong>Cazador de Gastos Hormiga</strong> • Desarrollado por <strong>Jhonatan Torres</strong> (
            <a
              href="https://github.com/JohnTorres24"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              @JohnTorres24
            </a>
            )
          </p>
          <div className="flex items-center space-x-4 font-bold">
            <a
              href="https://github.com/JohnTorres24/Hormiga"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1"
            >
              <span>Repositorio en GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onEnterApp}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-bold"
            >
              Abrir Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
