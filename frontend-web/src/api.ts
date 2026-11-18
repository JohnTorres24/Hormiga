import {
  AnalyticsOverview,
  CancellationGuide,
  Category,
  ExchangeRate,
  NotificationLog,
  PeriodAnalysis,
  ProfitabilityAnalysis,
  Subscription,
  UserSession
} from './types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'https://cazador-gastos-hormiga-api.onrender.com/api';

const SESSION_KEY = 'cazador_user_session';
const DEFAULT_USER: UserSession = {
  id: '3fc6e0b1-74cd-4f12-bd35-5b284d90c32e',
  fullName: 'Jhonatan Torres',
  email: 'jhonatan.torres@organizacion.com',
  preferredCurrency: 'COP'
};

export function getCurrentUser(): UserSession {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error al recuperar sesión local:', e);
  }
  return DEFAULT_USER;
}

export function setCurrentUser(user: UserSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Error al guardar sesión local:', e);
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Error al eliminar sesión:', e);
  }
}

function getAuthHeaders(): HeadersInit {
  const user = getCurrentUser();
  return {
    'Content-Type': 'application/json',
    'x-user-id': user.id
  };
}

export async function loginUser(email: string, password: string): Promise<UserSession> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
  }
  const session: UserSession = {
    id: json.data.id,
    fullName: json.data.fullName,
    email: json.data.email,
    preferredCurrency: json.data.preferredCurrency || 'COP'
  };
  setCurrentUser(session);
  return session;
}

export async function registerUser(
  email: string,
  password: string,
  fullName?: string,
  preferredCurrency: string = 'COP'
): Promise<UserSession> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, preferredCurrency })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Error del servidor interno al registrar la cuenta.');
  }
  const session: UserSession = {
    id: json.data.id,
    fullName: json.data.fullName,
    email: json.data.email,
    preferredCurrency: json.data.preferredCurrency || preferredCurrency
  };
  setCurrentUser(session);
  return session;
}

export async function fetchOverview(currency: string = 'COP'): Promise<AnalyticsOverview> {
  const res = await fetch(`${API_BASE}/analytics/overview?currency=${currency}`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  return json.data;
}

export async function fetchSubscriptions(status?: string, categoryId?: string): Promise<Subscription[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (categoryId) params.append('categoryId', categoryId);

  const res = await fetch(`${API_BASE}/subscriptions?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  return json.data || [];
}

export async function createSubscription(data: Partial<Subscription>): Promise<void> {
  const user = getCurrentUser();
  const payload = {
    ...data,
    userId: user.id
  };
  const res = await fetch(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || 'Error del servidor interno al registrar la suscripción');
  }
}

export async function updateSubscription(id: string, data: Partial<Subscription>): Promise<void> {
  const res = await fetch(`${API_BASE}/subscriptions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || 'Error del servidor interno al actualizar la suscripción');
  }
}

export async function deleteSubscription(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/subscriptions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || 'Error del servidor interno al eliminar la suscripción');
  }
}

export async function updateSubscriptionStatus(id: string, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/subscriptions/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || 'Error del servidor interno al actualizar estado');
  }
}

export async function fetchPeriodAnalysis(year: number, month: number): Promise<PeriodAnalysis> {
  const res = await fetch(`${API_BASE}/analytics/by-period?year=${year}&month=${month}`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  return json.data;
}

export async function fetchProfitability(): Promise<ProfitabilityAnalysis> {
  const res = await fetch(`${API_BASE}/analytics/profitability`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  return json.data;
}

export async function fetchExchangeRates(): Promise<ExchangeRate[]> {
  const res = await fetch(`${API_BASE}/currency/rates`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  return json.data || [];
}

export async function convertCurrency(amount: number, from: string, to: string): Promise<number> {
  const res = await fetch(`${API_BASE}/currency/convert?amount=${amount}&from=${from}&to=${to}`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  return json.data?.convertedAmount || amount;
}

export async function fetchAlerts(): Promise<NotificationLog[]> {
  const res = await fetch(`${API_BASE}/notifications/alerts`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  return json.data || [];
}

export async function dismissAlert(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/alerts/${id}/dismiss`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
}

export async function triggerAlertScan(): Promise<void> {
  await fetch(`${API_BASE}/notifications/scan`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
}

export async function fetchCancellationGuides(): Promise<CancellationGuide[]> {
  const res = await fetch(`${API_BASE}/cancellation-guides`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  return json.data || [];
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  return json.data || [];
}
