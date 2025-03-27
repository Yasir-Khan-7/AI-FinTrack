import { supabase } from '../lib/supabase';
import { Transaction, TransactionSummary } from '../types/Transaction';

/**
 * Fetches all transactions for the current user
 */
export async function fetchTransactions() {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        console.log('Auth user status:', user ? 'Logged in' : 'Not logged in');

        let query = supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        // Only filter by user_id if we have a logged in user
        if (user) {
            console.log('Fetching transactions for user ID:', user.id);
            query = query.eq('user_id', user.id);
        } else {
            console.log('Fetching all transactions (no user filter)');
        }

        console.log('Executing query:', JSON.stringify(query));
        const { data, error } = await query;

        if (error) {
            console.error('Error fetching transactions:', error);
            return { data: null, error: error.message };
        }

        if (!data || data.length === 0) {
            // Add a console.table message showing all sample data from the database
            console.log('No transactions found, fetching all transactions for debugging');

            const { data: allData, error: allError } = await supabase
                .from('transactions')
                .select('*')
                .limit(10);

            if (allError) {
                console.error('Error fetching all transactions:', allError);
            } else {
                console.log('All transactions in DB (limited to 10):', allData);

                // If we found transactions but none for this user, maybe the user_id is null
                // Let's check for that case
                if (allData && allData.length > 0) {
                    const transactionsWithoutUserId = allData.filter(t => !t.user_id);
                    if (transactionsWithoutUserId.length > 0) {
                        console.log('Found transactions without user_id:', transactionsWithoutUserId);

                        // Return these instead of empty array for testing
                        return { data: transactionsWithoutUserId, error: null };
                    }
                }
            }
        }

        console.log(`Successfully retrieved ${data?.length || 0} transactions from Supabase`);
        if (data && data.length > 0) {
            console.log('Sample transaction:', data[0]);
        } else {
            console.log('No transactions found in the database');
        }

        return { data, error: null };
    } catch (error: any) {
        console.error('Exception fetching transactions:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Adds a new transaction
 */
export async function addTransaction(transaction: Omit<Transaction, 'id' | 'user_id'>) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // Add user_id if a user is logged in
        const transactionToInsert = user
            ? { ...transaction, user_id: user.id }
            : { ...transaction };

        console.log('Adding transaction:', transactionToInsert);

        const { data, error } = await supabase
            .from('transactions')
            .insert(transactionToInsert)
            .select()
            .single();

        if (error) {
            console.error('Error adding transaction:', error);
            return { data: null, error: error.message };
        }

        console.log('Transaction added successfully:', data);
        return { data, error: null };
    } catch (error: any) {
        console.error('Exception adding transaction:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Deletes a transaction
 */
export async function deleteTransaction(id: string) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // Create the delete query
        let query = supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        // Only filter by user_id if a user is logged in
        if (user) {
            query = query.eq('user_id', user.id);
        }

        const { error } = await query;

        if (error) {
            console.error('Error deleting transaction:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('Exception deleting transaction:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Gets transactions by date range
 */
export async function getTransactionsByDateRange(startDate: string, endDate: string) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // Create query with date filters
        let query = supabase
            .from('transactions')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        // Only add user filter if logged in
        if (user) {
            query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching transactions by date range:', error);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error: any) {
        console.error('Exception fetching transactions by date range:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Calculates transaction summary
 */
export function calculateTransactionSummary(transactions: Transaction[]): TransactionSummary {
    const summary: TransactionSummary = {
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        categoryBreakdown: {}
    };

    for (const transaction of transactions) {
        const amount = transaction.amount;

        // Assume positive values are income, negative are expenses
        if (amount >= 0) {
            summary.totalIncome += amount;
        } else {
            summary.totalExpense += Math.abs(amount);
        }

        // Update category breakdown
        const category = transaction.category;
        if (!summary.categoryBreakdown[category]) {
            summary.categoryBreakdown[category] = 0;
        }
        summary.categoryBreakdown[category] += amount;
    }

    summary.netSavings = summary.totalIncome - summary.totalExpense;

    return summary;
} 