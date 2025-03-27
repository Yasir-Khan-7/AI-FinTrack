export interface ChatMessage {
    id?: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: string;
    user_id?: string;
}

export interface ChatHistoryResponse {
    data: ChatMessage[] | null;
    error: Error | null;
} 