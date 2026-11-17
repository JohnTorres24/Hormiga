export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'trial';
export type UsageFrequency = 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
export type ProfitabilityDiagnosis = 'critico_gasto_hormiga' | 'baja_rentabilidad' | 'moderada' | 'alta_rentabilidad';

export interface Subscription {
  id: string;
  userId: string;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  name: string;
  provider: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  paymentMethod?: string;
  firstBillingDate?: string;
  nextBillingDate: string;
  isFreeTrial: boolean;
  trialEndDate?: string | null;
  status: SubscriptionStatus;
  autoRenew: boolean;
  cancellationUrl?: string;
  cancellationGuideId?: string;
  cancellationNotes?: string;
  usageFrequency: UsageFrequency;
  perceivedValue: number; // 1 a 5
  normalizedMonthlyCost?: number;
  normalizedYearlyCost?: number;
  profitabilityDiagnosis?: ProfitabilityDiagnosis;
  daysUntilNextBilling?: number;
  daysUntilTrialEnd?: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  colorHex: string;
  description?: string;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  source: string;
  lastUpdatedAt: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  subscriptionId: string;
  subscriptionName: string;
  notificationType: 'trial_ending' | 'renewal_upcoming' | 'price_change' | 'ghost_expense_warning';
  scheduledFor: string;
  alertLeadHours: number;
  status: 'pending' | 'sent' | 'dismissed' | 'failed';
  channel: 'email' | 'push' | 'in_app';
  title: string;
  message: string;
  sentAt?: string;
  createdAt: string;
}

export interface CancellationGuide {
  id: string;
  serviceName: string;
  providerSlug: string;
  categorySlug?: string;
  logoUrl?: string;
  directCancellationUrl: string;
  stepByStepInstructionsJson: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  estimatedTimeMinutes: number;
  cancellationTrapsWarning?: string;
}

export interface AnalyticsOverview {
  userId: string;
  preferredCurrency: string;
  totalActiveSubscriptions: number;
  activeFreeTrials: number;
  totalMonthlyCommitment: number;
  totalYearlyCommitment: number;
  totalGhostExpenses: number;
  potentialAnnualSavings: number;
  highestExpense?: {
    id: string;
    name: string;
    provider: string;
    price: number;
    currency: string;
    normalizedMonthlyCost: number;
    normalizedYearlyCost: number;
  } | null;
}

export interface PeriodAnalysis {
  year: number;
  month: number;
  totalAmount: number;
  currency: string;
  chargesByDay: Array<{
    day: number;
    subscriptionName: string;
    amount: number;
    currency: string;
    convertedAmount: number;
    categoryName?: string;
    categoryColor?: string;
  }>;
  categoryBreakdown: Array<{
    categoryName: string;
    categoryColor: string;
    totalAmount: number;
    percentage: number;
  }>;
}

export interface ProfitabilityAnalysis {
  mostProfitable: Array<{
    id: string;
    name: string;
    provider: string;
    usageFrequency: string;
    perceivedValue: number;
    yearlyCostConverted: number;
    currency: string;
    diagnosis: string;
  }>;
  leastProfitable: Array<{
    id: string;
    name: string;
    provider: string;
    usageFrequency: string;
    perceivedValue: number;
    yearlyCostConverted: number;
    currency: string;
    diagnosis: string;
  }>;
  ghostExpenses: Array<{
    id: string;
    name: string;
    provider: string;
    usageFrequency: string;
    perceivedValue: number;
    yearlyCostConverted: number;
    currency: string;
    diagnosis: string;
  }>;
  annualGhostExpenseTotal: number;
  currency: string;
}
