// Expense categories organized by group
export const EXPENSE_CATEGORIES = {
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

// Currency
export const DEFAULT_CURRENCY = 'USD';
