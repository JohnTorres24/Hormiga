import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Category, Subscription } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Subscription>) => Promise<void>;
  categories: Category[];
  initialData?: Subscription | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData
}) => {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('COP');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [categoryId, setCategoryId] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState('');
  const [usageFrequency, setUsageFrequency] = useState('weekly');
  const [perceivedValue, setPerceivedValue] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setProvider(initialData.provider);
      setPrice(initialData.price);
      setCurrency(initialData.currency);
      setBillingCycle(initialData.billingCycle);
      setCategoryId(initialData.categoryId || '');
      setNextBillingDate(initialData.nextBillingDate);
      setIsFreeTrial(initialData.isFreeTrial);
      setTrialEndDate(initialData.trialEndDate || '');
      setUsageFrequency(initialData.usageFrequency);
      setPerceivedValue(initialData.perceivedValue);
    } else {
      setName('');
      setProvider('');
      setPrice('');
      setCurrency('COP');
      setBillingCycle('monthly');
      setCategoryId(categories[0]?.id || '');
      const future = new Date();
      future.setDate(future.getDate() + 30);
      setNextBillingDate(future.toISOString().split('T')[0]);
      setIsFreeTrial(false);
      setTrialEndDate('');
      setUsageFrequency('weekly');
      setPerceivedValue(3);
    }
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const numPrice = Number(price) || 0;
  let annualized = numPrice;
  if (billingCycle === 'monthly') annualized = numPrice * 12;
  else if (billingCycle === 'weekly') annualized = numPrice * 52;
  else if (billingCycle === 'quarterly') annualized = numPrice * 4;
  else if (billingCycle === 'biannual') annualized = numPrice * 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !provider || price === '' || !nextBillingDate) return;

    setLoading(true);
    try {
      await onSave({
        name,
        provider,
        price: Number(price),
        currency,
        billingCycle: billingCycle as any,
        categoryId: categoryId || undefined,
        nextBillingDate,
        isFreeTrial,
        trialEndDate: isFreeTrial && trialEndDate ? trialEndDate : null,
        status: isFreeTrial ? 'trial' : 'active',
        usageFrequency: usageFrequency as any,
        perceivedValue
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-700 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {initialData ? 'Editar Suscripción' : 'Registrar Nueva Suscripción'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configura los cobros y activa el cazador de gastos hormiga</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre del Servicio *</label>
              <input
                type="text"
                required
                placeholder="Ej. Netflix 4K, Spotify Familiar..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Proveedor / Compañía *</label>
              <input
                type="text"
                required
                placeholder="Ej. Netflix, Spotify, Apple, OpenAI..."
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Moneda</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="COP">COP ($)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="MXN">MXN ($)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Precio Cobrado *</label>
              <input
                type="number"
                step="any"
                required
                placeholder="44900"
                value={price}
                onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Ciclo de Cobro</label>
              <select
                value={billingCycle}
                onChange={e => setBillingCycle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
                <option value="quarterly">Trimestral</option>
                <option value="biannual">Semestral</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Próxima Fecha de Cobro *</label>
            <input
              type="date"
              required
              value={nextBillingDate}
              onChange={e => setNextBillingDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Control de Prueba Gratuita */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={isFreeTrial}
                onChange={e => setIsFreeTrial(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="font-bold text-indigo-900 dark:text-indigo-200">¿Es un periodo de prueba gratuita (Free Trial)?</span>
            </label>

            {isFreeTrial && (
              <div>
                <label className="block text-indigo-800 dark:text-indigo-300 mb-1 text-[11px]">
                  Fecha límite en que expira la prueba (alerta 48h antes):
                </label>
                <input
                  type="date"
                  required={isFreeTrial}
                  value={trialEndDate}
                  onChange={e => setTrialEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Diagnóstico Cazador de Gastos Hormiga */}
          <div className="bg-slate-50 dark:bg-slate-750/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Evaluación de Rentabilidad & Utilidad
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">¿Con qué frecuencia lo usas?</label>
                <select
                  value={usageFrequency}
                  onChange={e => setUsageFrequency(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="daily">Todos los días</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="monthly">Una vez al mes</option>
                  <option value="rarely">Rara vez</option>
                  <option value="never">Casi nunca / Olvidada</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">
                  Valor Percibido (1 = Inútil, 5 = Esencial): {perceivedValue}★
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={perceivedValue}
                  onChange={e => setPerceivedValue(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>

          {/* Cálculo de impacto previo */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-3.5 rounded-2xl flex items-center justify-between border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Impacto Anualizado</span>
              <div className="text-base font-black text-indigo-400">
                {currency} {annualized.toLocaleString('es-CO')} / año
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Cálculo automático</span>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar Suscripción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
