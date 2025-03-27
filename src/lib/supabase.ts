import { createClient } from '@supabase/supabase-js';
import { Transaction } from '../types/Transaction';
import { ChatMessage } from '../types/ChatMessage';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Transaction functions
export async function fetchTransactions() {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Exception fetching transactions:', error);
        return { data: null, error };
    }
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>) {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transaction)
            .select()
            .single();

        if (error) {
            console.error('Error adding transaction:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Exception adding transaction:', error);
        return { data: null, error };
    }
}

export async function deleteTransaction(id: string) {
    try {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting transaction:', error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Exception deleting transaction:', error);
        return { success: false, error };
    }
}

// Chat history functions
export async function fetchChatHistory(limit = 50) {
    try {
        const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .order('timestamp', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('Error fetching chat history:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Exception fetching chat history:', error);
        return { data: null, error };
    }
}

export async function addChatMessage(message: Omit<ChatMessage, 'id'>) {
    try {
        const { data, error } = await supabase
            .from('chat_history')
            .insert(message)
            .select()
            .single();

        if (error) {
            console.error('Error adding chat message:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Exception adding chat message:', error);
        return { data: null, error };
    }
}

export async function clearChatHistory() {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('user_id', user?.id || '');

        if (error) {
            console.error('Error clearing chat history:', error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Exception clearing chat history:', error);
        return { success: false, error };
    }
} 