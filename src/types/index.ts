export * from './Transaction';
export * from './ChatMessage';

export type Category = 'Income' | 'Expense';

export type IncomeSubcategory = 'Salary' | 'Freelance' | 'Investment' | 'Gift' | 'Other Income';
export type ExpenseSubcategory =
    | 'Housing'
    | 'Transportation'
    | 'Food'
    | 'Utilities'
    | 'Healthcare'
    | 'Insurance'
    | 'Entertainment'
    | 'Education'
    | 'Shopping'
    | 'Personal Care'
    | 'Travel'
    | 'Debt Payments'
    | 'Savings'
    | 'Investments'
    | 'Gifts & Donations'
    | 'Other Expenses';

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    category: Category;
    subcategory: Category extends 'Income' ? IncomeSubcategory : ExpenseSubcategory;
    description: string;
    tags?: string[];
}

export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    categoryBreakdown: Record<string, number>;
} 