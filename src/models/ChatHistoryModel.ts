import { supabase } from '../lib/supabase';
import { ChatMessage } from '../types/ChatMessage';

const MAX_CHAT_HISTORY = 50;

/**
 * Fetches chat history for the current user
 */
export async function fetchChatHistory() {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'User not authenticated' };
        }

        const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: true })
            .limit(MAX_CHAT_HISTORY);

        if (error) {
            console.error('Error fetching chat history:', error);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error: any) {
        console.error('Exception fetching chat history:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Adds a new chat message
 */
export async function addChatMessage(content: string, sender: 'user' | 'assistant') {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'User not authenticated' };
        }

        const message: Omit<ChatMessage, 'id'> = {
            content,
            sender,
            timestamp: new Date().toISOString(),
            user_id: user.id
        };

        const { data, error } = await supabase
            .from('chat_history')
            .insert(message)
            .select()
            .single();

        if (error) {
            console.error('Error adding chat message:', error);
            return { data: null, error: error.message };
        }

        // After adding a new message, check if we need to enforce the limit
        await limitChatHistory();

        return { data, error: null };
    } catch (error: any) {
        console.error('Exception adding chat message:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Clears all chat history for the current user
 */
export async function clearChatHistory() {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            console.error('Error clearing chat history:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('Exception clearing chat history:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Limits chat history to the most recent MAX_CHAT_HISTORY messages
 * This is important to prevent excessive storage usage
 */
async function limitChatHistory() {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Get count of messages
        const { count, error: countError } = await supabase
            .from('chat_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (countError) {
            console.error('Error counting chat messages:', countError);
            return;
        }

        // If we have more messages than the limit, delete the oldest ones
        if (count && count > MAX_CHAT_HISTORY) {
            // Find IDs of oldest messages that need to be deleted
            const overLimit = count - MAX_CHAT_HISTORY;

            const { data: oldestMessages, error: fetchError } = await supabase
                .from('chat_history')
                .select('id')
                .eq('user_id', user.id)
                .order('timestamp', { ascending: true })
                .limit(overLimit);

            if (fetchError || !oldestMessages) {
                console.error('Error fetching oldest messages:', fetchError);
                return;
            }

            // Delete the oldest messages
            const ids = oldestMessages.map(msg => msg.id);

            const { error: deleteError } = await supabase
                .from('chat_history')
                .delete()
                .in('id', ids);

            if (deleteError) {
                console.error('Error deleting oldest messages:', deleteError);
            }
        }
    } catch (error) {
        console.error('Exception limiting chat history:', error);
    }
}

/**
 * Get local chat history when not authenticated
 */
export function getLocalChatHistory(): ChatMessage[] {
    const stored = localStorage.getItem('chatHistory');
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error parsing local chat history:', error);
        return [];
    }
}

/**
 * Save chat history to local storage when not authenticated
 */
export function saveLocalChatHistory(messages: ChatMessage[]): void {
    try {
        localStorage.setItem('chatHistory', JSON.stringify(messages.slice(-MAX_CHAT_HISTORY)));
    } catch (error) {
        console.error('Error saving local chat history:', error);
    }
} 