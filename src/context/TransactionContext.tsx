import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    Transaction,
    TransactionSummary,
    Category,
    ExpenseSubcategory,
    IncomeSubcategory
} from '../types';
import * as TransactionModel from '../models/TransactionModel';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface TransactionContextType {
    transactions: Transaction[];
    loading: boolean;
    addTransaction: (
        date: Date,
        amount: number,
        category: Category,
        subcategory: string,
        description: string,
        tags?: string[]
    ) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
    getTransactionSummary: (startDate: Date, endDate: Date) => TransactionSummary;
    exportToCSV: (startDate: Date, endDate: Date) => void;
    refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
};

interface TransactionProviderProps {
    children: ReactNode;
}

// Simple format function to replace date-fns
const formatDate = (date: Date): string => {
    // Format as YYYY-MM-DD which is more standard for databases
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Memoize refreshTransactions to prevent infinite loops in useEffect dependencies
    const refreshTransactions = useCallback(async () => {
        setLoading(true);
        try {
            if (user?.id) {
                console.log('Refreshing transactions for user:', user.id);
                const { data, error } = await TransactionModel.fetchTransactions();

                if (error) {
                    console.error('Error fetching transactions:', error);
                    throw new Error(error);
                }

                if (data) {
                    console.log(`Fetched ${data.length} transactions from Supabase`);
                    setTransactions(data);
                } else {
                    console.log('No transactions found or returned from Supabase');
                    setTransactions([]);
                }
            } else {
                console.log('No user logged in, using localStorage for transactions');
                // Fallback to localStorage if no user is logged in
                const savedTransactions = localStorage.getItem('transactions');
                if (savedTransactions) {
                    setTransactions(JSON.parse(savedTransactions));
                } else {
                    setTransactions([]);
                }
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            // Fallback to localStorage if Supabase fails
            const savedTransactions = localStorage.getItem('transactions');
            if (savedTransactions) {
                console.log('Falling back to localStorage transactions');
                setTransactions(JSON.parse(savedTransactions));
            } else {
                setTransactions([]);
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Fetch transactions from Supabase when component mounts or user changes
    useEffect(() => {
        refreshTransactions();
    }, [refreshTransactions]);

    // Add transaction
    const addTransaction = async (
        date: Date,
        amount: number,
        category: Category,
        subcategory: string,
        description: string,
        tags?: string[]
    ) => {
        const formattedDate = formatDate(date);

        console.log('Adding transaction with data:', {
            date: formattedDate,
            amount,
            category,
            subcategory,
            description,
            tags
        });

        // Create transaction object without id and user_id (will be added in the model)
        const newTransaction: Omit<Transaction, 'id' | 'user_id'> = {
            date: formattedDate,
            amount,
            category,
            subcategory: subcategory as any,
            description,
            tags
        };

        try {
            if (user?.id) {
                console.log('User is logged in, adding to Supabase with user ID:', user.id);
                // Add to Supabase if user is logged in
                const { data, error } = await TransactionModel.addTransaction(newTransaction);

                if (error) {
                    console.error('Error from Supabase:', error);
                    throw new Error(error);
                }

                // Immediately update the local state with the new transaction
                if (data) {
                    console.log('Transaction added successfully to Supabase:', data);
                    setTransactions(prev => [...prev, data]);
                } else {
                    console.error('No data returned from Supabase after adding transaction');
                }

                // Then refresh to ensure everything is in sync
                await refreshTransactions();
            } else {
                console.log('User not logged in, saving to localStorage only');
                // Fallback to localStorage
                const localTransaction = {
                    ...newTransaction,
                    id: uuidv4()
                };
                const updatedTransactions = [...transactions, localTransaction];
                setTransactions(updatedTransactions);
                localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            // Add to local state even if Supabase fails
            const localTransaction = {
                ...newTransaction,
                id: uuidv4()
            };
            const updatedTransactions = [...transactions, localTransaction];
            setTransactions(updatedTransactions);
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        }
    };

    // Delete transaction
    const deleteTransaction = async (id: string) => {
        try {
            if (user?.id) {
                // Delete from Supabase if user is logged in
                const { success, error } = await TransactionModel.deleteTransaction(id);
                if (!success && error) {
                    throw new Error(error);
                }
                // Immediately update the local state
                setTransactions(prev => prev.filter(transaction => transaction.id !== id));
                // Then refresh to ensure everything is in sync
                await refreshTransactions();
            } else {
                // Fallback to localStorage
                const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
                setTransactions(updatedTransactions);
                localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            // Update local state even if Supabase fails
            setTransactions(prev => prev.filter(transaction => transaction.id !== id));
        }
    };

    const getTransactionsByDateRange = (startDate: Date, endDate: Date): Transaction[] => {
        // Format dates for logging and comparison
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        console.log('Getting transactions in date range:', {
            startDate: startStr,
            endDate: endStr,
            totalTransactions: transactions.length
        });

        if (transactions.length === 0) {
            console.log('No transactions available to filter');
            return [];
        }

        // Filter transactions by date
        const filteredTransactions = transactions.filter(transaction => {
            try {
                // If transaction doesn't have a date, skip it
                if (!transaction.date) {
                    console.warn('Transaction missing date:', transaction);
                    return false;
                }

                // Convert various date formats to a consistent Date object
                let transactionDate: Date;

                // Check for DD-MM-YYYY format
                if (/^\d{2}-\d{2}-\d{4}$/.test(transaction.date)) {
                    const [day, month, year] = transaction.date.split('-').map(Number);
                    // Convert to YYYY-MM-DD format for parsing
                    transactionDate = new Date(year, month - 1, day);
                }
                // Check for YYYY-MM-DD format
                else if (/^\d{4}-\d{2}-\d{2}$/.test(transaction.date)) {
                    transactionDate = new Date(transaction.date);
                }
                // Handle MM/DD/YYYY format 
                else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(transaction.date)) {
                    const [month, day, year] = transaction.date.split('/').map(Number);
                    transactionDate = new Date(year, month - 1, day);
                }
                else {
                    // Try to parse with built-in Date constructor as fallback
                    transactionDate = new Date(transaction.date);
                }

                // Ensure we have a valid date
                if (isNaN(transactionDate.getTime())) {
                    console.warn('Invalid date format:', transaction.date);
                    return false;
                }

                // Reset all dates to midnight for comparison
                const transactionDateOnly = new Date(
                    transactionDate.getFullYear(),
                    transactionDate.getMonth(),
                    transactionDate.getDate()
                );

                const startDateCompare = new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate()
                );

                const endDateCompare = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth(),
                    endDate.getDate(),
                    23, 59, 59 // Include the entire end day
                );

                // Check if the date is within range
                return transactionDateOnly >= startDateCompare && transactionDateOnly <= endDateCompare;
            } catch (error) {
                console.error('Error processing transaction date:', error, transaction);
                return false;
            }
        });

        console.log(`Filtered ${transactions.length} transactions to ${filteredTransactions.length} within date range`);
        return filteredTransactions;
    };

    const getTransactionSummary = (startDate: Date, endDate: Date): TransactionSummary => {
        const filteredTransactions = getTransactionsByDateRange(startDate, endDate);

        // Calculate total income from transactions with category 'Income'
        const totalIncome = filteredTransactions
            .filter(t => t.category === 'Income')
            .reduce((sum, t) => sum + t.amount, 0);

        // Calculate total expense from transactions with category 'Expense'
        // Store expense as absolute value (positive) for display purposes
        const totalExpenseRaw = filteredTransactions
            .filter(t => t.category === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Display expense as positive value
        const totalExpense = Math.abs(totalExpenseRaw);

        // Calculate breakdown by subcategory
        const categoryBreakdown: Record<string, number> = {};

        filteredTransactions.forEach(transaction => {
            const key = transaction.subcategory;
            if (!categoryBreakdown[key]) {
                categoryBreakdown[key] = 0;
            }
            categoryBreakdown[key] += transaction.amount;
        });

        // Calculate net savings
        // If expenses are stored as negative numbers, we should add instead of subtract
        const netSavings = totalExpenseRaw < 0
            ? totalIncome + totalExpenseRaw // For negative expenses: income + expense (which is negative)
            : totalIncome - totalExpense;   // For positive expenses: income - expense

        return {
            totalIncome,
            totalExpense,
            netSavings,
            categoryBreakdown
        };
    };

    const exportToCSV = (startDate: Date, endDate: Date) => {
        const filteredTransactions = getTransactionsByDateRange(startDate, endDate);

        if (filteredTransactions.length === 0) {
            alert('No transactions to export in the selected date range.');
            return;
        }

        // Create CSV headers
        const headers = ['Date', 'Amount', 'Category', 'Subcategory', 'Description', 'Tags'];

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(t => [
                t.date,
                t.amount,
                t.category,
                t.subcategory,
                `"${t.description.replace(/"/g, '""')}"`, // Escape quotes in description
                t.tags ? `"${t.tags.join(', ')}"` : ''
            ].join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `finance_report_${formatDate(startDate)}_to_${formatDate(endDate)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <TransactionContext.Provider
            value={{
                transactions,
                loading,
                addTransaction,
                deleteTransaction,
                getTransactionsByDateRange,
                getTransactionSummary,
                exportToCSV,
                refreshTransactions
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
}; 