import { supabase } from '../lib/supabase';

export interface ChatMessage {
    id?: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date | string;
    user_id?: string;
}

export const fetchChatHistory = async (userId: string, limit = 20): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }

    return data.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
    })) || [];
};

export const addChatMessage = async (message: ChatMessage): Promise<ChatMessage | null> => {
    const { data, error } = await supabase
        .from('chat_history')
        .insert([
            {
                content: message.content,
                sender: message.sender,
                timestamp: message.timestamp,
                user_id: message.user_id
            }
        ])
        .select();

    if (error) {
        console.error('Error adding chat message:', error);
        return null;
    }

    return data?.[0] || null;
};

export const clearChatHistory = async (userId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error('Error clearing chat history:', error);
        return false;
    }

    return true;
};

// Local storage fallback for when user is not logged in
export const getLocalChatHistory = (): ChatMessage[] => {
    try {
        const history = localStorage.getItem('chat_history');
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error retrieving chat history from local storage:', error);
        return [];
    }
};

export const saveLocalChatHistory = (messages: ChatMessage[]): void => {
    try {
        localStorage.setItem('chat_history', JSON.stringify(messages));
    } catch (error) {
        console.error('Error saving chat history to local storage:', error);
    }
};

// Keep only the last N messages to limit token usage
export const limitChatHistory = (messages: ChatMessage[], limit = 10): ChatMessage[] => {
    if (messages.length <= limit) return messages;
    return messages.slice(messages.length - limit);
}; 