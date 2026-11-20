import React, { useState } from 'react';
import { Lock, Mail, User, AlertCircle, LogIn, UserPlus, Sun, Moon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { loginUser, registerUser } from '../api';
import { UserSession } from '../types';

interface LoginViewProps {
  onSuccess: (user: UserSession) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onGoToLanding: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSuccess,
  isDarkMode,
  onToggleTheme,
  onGoToLanding
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!email.trim() || !password.trim() || !fullName.trim()) {
          throw new Error('Todos los campos son obligatorios para registrarse.');
        }
        const user = await registerUser(email.trim(), password.trim(), fullName.trim());
        onSuccess(user);
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Ingresa tu correo electrónico y contraseña.');
        }
        const user = await loginUser(email.trim(), password.trim());
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación. Por favor, verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginUser('jhonatan.torres@organizacion.com', '123456');
      onSuccess(user);
    } catch {
      // Si la cuenta remota requiere creación previa o falla la red, establecer sesión local de demostración
      const fallbackUser: UserSession = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'jhonatan.torres@organizacion.com',
        fullName: 'Jhonatan Torres',
        preferredCurrency: 'COP'
      };
      onSuccess(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Barra superior de navegación */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
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
                Seguridad
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Acceso a la plataforma financiera y auditoría de suscripciones
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Alternador de Modo Oscuro */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-xs"
            title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Enlace hacia la portada */}
          <button
            onClick={onGoToLanding}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200/70 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            <span>🏠 Ver Portada / APK</span>
          </button>
        </div>
      </header>

      {/* Contenedor central del formulario */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
              {isRegisterMode ? <UserPlus className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isRegisterMode
                ? 'Regístrate para auditar y erradicar cobros invisibles'
                : 'Ingresa tus credenciales para acceder a tu panel de control'}
            </p>
          </div>

          {/* Alternador de pestañas */}
          <div className="grid grid-cols-2 p-1 mb-5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError(null);
              }}
              className={`py-2 text-xs font-black rounded-xl transition ${
                !isRegisterMode
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError(null);
              }}
              className={`py-2 text-xs font-black rounded-xl transition ${
                isRegisterMode
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Banner de error */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario de credenciales */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required={isRegisterMode}
                    placeholder="Ej. Jhonatan Torres"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="usuario@organizacion.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Introduce tu clave secreta"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Validando credenciales...</span>
              ) : isRegisterMode ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Completar Registro</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar a la Plataforma</span>
                </>
              )}
            </button>
          </form>

          {/* Tarjeta de Acceso Rápido con Cuenta de Demostración */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Acceso Rápido de Evaluación
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  1 Clic
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                Ingresa inmediatamente con la cuenta oficial preconfigurada para probar todas las funciones financieras.
              </p>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <span>Acceder como Jhonatan Torres</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Cazador de Gastos Hormiga. Ninguna sesión activa por defecto.</p>
          <div className="flex items-center space-x-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Autenticación y privacidad reforzada</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
