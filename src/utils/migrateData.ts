import { supabase } from '../lib/supabase';
import { Transaction } from '../types/Transaction';

/**
 * Migrates transaction data from localStorage to Supabase
 * @returns {Promise<{success: boolean, migratedCount: number, error?: string}>}
 */
export const migrateLocalStorageToSupabase = async (): Promise<{
    success: boolean;
    migratedCount: number;
    error?: string;
}> => {
    try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                migratedCount: 0,
                error: 'User not authenticated',
            };
        }

        // Get transactions from localStorage
        const localTransactions = localStorage.getItem('transactions');

        if (!localTransactions) {
            return {
                success: true,
                migratedCount: 0,
            };
        }

        const transactions: Transaction[] = JSON.parse(localTransactions);

        if (!transactions.length) {
            return {
                success: true,
                migratedCount: 0,
            };
        }

        // Prepare transactions for insertion
        const transactionsToInsert = transactions.map(transaction => ({
            user_id: user.id,
            date: transaction.date,
            amount: transaction.amount,
            category: transaction.category,
            subcategory: transaction.subcategory || '',
            description: transaction.description || '',
            tags: transaction.tags || [],
        }));

        // Insert transactions in batches
        let migratedCount = 0;
        const BATCH_SIZE = 50;

        for (let i = 0; i < transactionsToInsert.length; i += BATCH_SIZE) {
            const batch = transactionsToInsert.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('transactions').insert(batch);

            if (error) {
                console.error('Error migrating batch:', error);
                return {
                    success: false,
                    migratedCount,
                    error: `Error migrating batch: ${error.message}`,
                };
            }

            migratedCount += batch.length;
        }

        // Migration successful, clear localStorage
        localStorage.removeItem('transactions');

        return {
            success: true,
            migratedCount,
        };
    } catch (error: any) {
        console.error('Error migrating data:', error);
        return {
            success: false,
            migratedCount: 0,
            error: `Error migrating data: ${error.message}`,
        };
    }
};

/**
 * Migrates chat history from localStorage to Supabase
 * @returns {Promise<{success: boolean, migratedCount: number, error?: string}>}
 */
export const migrateChatHistoryToSupabase = async (): Promise<{
    success: boolean;
    migratedCount: number;
    error?: string;
}> => {
    try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                migratedCount: 0,
                error: 'User not authenticated',
            };
        }

        // Get chat history from localStorage
        const localChatHistory = localStorage.getItem('chatHistory');

        if (!localChatHistory) {
            return {
                success: true,
                migratedCount: 0,
            };
        }

        const chatHistory = JSON.parse(localChatHistory);

        if (!chatHistory.length) {
            return {
                success: true,
                migratedCount: 0,
            };
        }

        // Prepare chat messages for insertion
        const messagesToInsert = chatHistory.map((message: any) => ({
            user_id: user.id,
            content: message.content,
            sender: message.sender,
            timestamp: message.timestamp || new Date().toISOString(),
        }));

        // Limit to most recent 50 messages
        const recentMessages = messagesToInsert.slice(-50);

        // Insert messages
        const { error } = await supabase.from('chat_history').insert(recentMessages);

        if (error) {
            console.error('Error migrating chat history:', error);
            return {
                success: false,
                migratedCount: 0,
                error: `Error migrating chat history: ${error.message}`,
            };
        }

        // Migration successful, clear localStorage
        localStorage.removeItem('chatHistory');

        return {
            success: true,
            migratedCount: recentMessages.length,
        };
    } catch (error: any) {
        console.error('Error migrating chat history:', error);
        return {
            success: false,
            migratedCount: 0,
            error: `Error migrating chat history: ${error.message}`,
        };
    }
}; 