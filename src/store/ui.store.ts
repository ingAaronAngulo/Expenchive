import { create } from 'zustand';

interface DateRange {
  start: Date;
  end: Date;
}

interface UIState {
  // Modals
  isAddAccountOpen: boolean;
  isAddExpenseOpen: boolean;
  isAddCreditCardOpen: boolean;
  isAddInvestmentOpen: boolean;
  isAddRecurringExpenseOpen: boolean;
  isAddLoanOpen: boolean;

  // Filters
  dateRange: DateRange | null;
  selectedCategory: string | null;

  // Actions
  openAddAccountModal: () => void;
  closeAddAccountModal: () => void;
  openAddExpenseModal: () => void;
  closeAddExpenseModal: () => void;
  openAddCreditCardModal: () => void;
  closeAddCreditCardModal: () => void;
  openAddInvestmentModal: () => void;
  closeAddInvestmentModal: () => void;
  openAddRecurringExpenseModal: () => void;
  closeAddRecurringExpenseModal: () => void;
  openAddLoanModal: () => void;
  closeAddLoanModal: () => void;
  setDateRange: (range: DateRange | null) => void;
  setSelectedCategory: (category: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isAddAccountOpen: false,
  isAddExpenseOpen: false,
  isAddCreditCardOpen: false,
  isAddInvestmentOpen: false,
  isAddRecurringExpenseOpen: false,
  isAddLoanOpen: false,
  dateRange: null,
  selectedCategory: null,

  // Actions
  openAddAccountModal: () => set({ isAddAccountOpen: true }),
  closeAddAccountModal: () => set({ isAddAccountOpen: false }),
  openAddExpenseModal: () => set({ isAddExpenseOpen: true }),
  closeAddExpenseModal: () => set({ isAddExpenseOpen: false }),
  openAddCreditCardModal: () => set({ isAddCreditCardOpen: true }),
  closeAddCreditCardModal: () => set({ isAddCreditCardOpen: false }),
  openAddInvestmentModal: () => set({ isAddInvestmentOpen: true }),
  closeAddInvestmentModal: () => set({ isAddInvestmentOpen: false }),
  openAddRecurringExpenseModal: () => set({ isAddRecurringExpenseOpen: true }),
  closeAddRecurringExpenseModal: () => set({ isAddRecurringExpenseOpen: false }),
  openAddLoanModal: () => set({ isAddLoanOpen: true }),
  closeAddLoanModal: () => set({ isAddLoanOpen: false }),
  setDateRange: (range) => set({ dateRange: range }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
