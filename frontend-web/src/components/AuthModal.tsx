import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { loginUser, registerUser } from '../api';
import { UserSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!email || !password) {
          throw new Error('Todos los campos son obligatorios.');
        }
        const user = await registerUser(email, password, fullName);
        onSuccess(user);
        onClose();
      } else {
        if (!email || !password) {
          throw new Error('Ingresa tu correo y contraseña.');
        }
        const user = await loginUser(email, password);
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error del servidor interno. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {isRegisterMode ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRegisterMode ? 'Regístrate para auditar tus gastos hormiga' : 'Accede a tu panel financiero sincronizado'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Ej. Jhonatan Torres"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none transition disabled:opacity-50"
          >
            {loading
              ? 'Procesando...'
              : isRegisterMode
              ? 'Registrarme'
              : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-4 pt-3 text-center border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {isRegisterMode
              ? '¿Ya tienes una cuenta? Inicia sesión aquí'
              : '¿No tienes cuenta aún? Regístrate gratis'}
          </button>
        </div>
      </div>
    </div>
  );
};
