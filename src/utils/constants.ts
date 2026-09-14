// Expense categories organized by group
export const EXPENSE_CATEGORIES = {
  Quick: ['Quick'],
  Essential: ['Food', 'Transportation', 'Housing', 'Utilities', 'Healthcare', 'Insurance'],
  Lifestyle: ['Entertainment', 'Shopping', 'Dining Out', 'Travel', 'Hobbies'],
  Financial: ['Savings', 'Investments', 'Debt Payments', 'Subscriptions'],
} as const;

// Flat list of all categories
export const ALL_CATEGORIES = Object.values(EXPENSE_CATEGORIES).flat();

// Frequency types for recurring expenses
export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

// Account types
export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
] as const;

export const PAYMENT_SOURCE_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0891b2',
  '#475569',
] as const;

export const DEFAULT_PAYMENT_SOURCE_COLOR = PAYMENT_SOURCE_COLORS[0];

// Currency
export const DEFAULT_CURRENCY = 'USD';
