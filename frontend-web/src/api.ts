import {
  AnalyticsOverview,
  CancellationGuide,
  Category,
  ExchangeRate,
  NotificationLog,
  PeriodAnalysis,
  ProfitabilityAnalysis,
  Subscription
} from './types';

const API_BASE = '/api';

export async function fetchOverview(): Promise<AnalyticsOverview> {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  const json = await res.json();
  return json.data;
}

export async function fetchSubscriptions(status?: string, categoryId?: string): Promise<Subscription[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (categoryId) params.append('categoryId', categoryId);

  const res = await fetch(`${API_BASE}/subscriptions?${params.toString()}`);
  const json = await res.json();
  return json.data || [];
}

export async function createSubscription(data: Partial<Subscription>): Promise<void> {
  const res = await fetch(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al registrar la suscripción');
}

export async function updateSubscription(id: string, data: Partial<Subscription>): Promise<void> {
  const res = await fetch(`${API_BASE}/subscriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar la suscripción');
}

export async function deleteSubscription(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/subscriptions/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Error al eliminar la suscripción');
}

export async function updateSubscriptionStatus(id: string, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/subscriptions/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
}

export async function fetchPeriodAnalysis(year: number, month: number): Promise<PeriodAnalysis> {
  const res = await fetch(`${API_BASE}/analytics/by-period?year=${year}&month=${month}`);
  const json = await res.json();
  return json.data;
}

export async function fetchProfitability(): Promise<ProfitabilityAnalysis> {
  const res = await fetch(`${API_BASE}/analytics/profitability`);
  const json = await res.json();
  return json.data;
}

export async function fetchExchangeRates(): Promise<ExchangeRate[]> {
  const res = await fetch(`${API_BASE}/currency/rates`);
  const json = await res.json();
  return json.data || [];
}

export async function convertCurrency(amount: number, from: string, to: string): Promise<number> {
  const res = await fetch(`${API_BASE}/currency/convert?amount=${amount}&from=${from}&to=${to}`);
  const json = await res.json();
  return json.data?.convertedAmount || amount;
}

export async function fetchAlerts(): Promise<NotificationLog[]> {
  const res = await fetch(`${API_BASE}/notifications/alerts`);
  const json = await res.json();
  return json.data || [];
}

export async function dismissAlert(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/alerts/${id}/dismiss`, { method: 'PATCH' });
}

export async function triggerAlertScan(): Promise<void> {
  await fetch(`${API_BASE}/notifications/scan`, { method: 'POST' });
}

export async function fetchCancellationGuides(): Promise<CancellationGuide[]> {
  const res = await fetch(`${API_BASE}/cancellation-guides`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  const json = await res.json();
  return json.data || [];
}
