export interface Transaction {
    id: string;
    date: string;
    amount: number;
    category: string;
    subcategory: string;
    description?: string;
    tags?: string[];
    user_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    categoryBreakdown: {
        [category: string]: number;
    };
} 