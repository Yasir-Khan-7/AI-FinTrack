import React, { useState, useRef, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Button,
    CircularProgress,
    TextField,
    Avatar,
    List,
    ListItem,
    Divider,
    IconButton,
    InputAdornment,
    Alert,
    Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types/ChatMessage';
import * as ChatHistoryModel from '../models/ChatHistoryModel';

const AIFinancialAssistant: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { getTransactionSummary } = useTransactions();

    // Fetch chat history when component mounts or user changes
    useEffect(() => {
        loadChatHistory();
    }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChatHistory = async () => {
        setHistoryLoading(true);
        try {
            let chatHistory: ChatMessage[] = [];

            if (user?.id) {
                // Fetch from Supabase if user is logged in
                const { data, error } = await ChatHistoryModel.fetchChatHistory();
                if (error) {
                    throw new Error(error);
                }
                if (data) {
                    chatHistory = data;
                }
            } else {
                // Fallback to localStorage
                chatHistory = ChatHistoryModel.getLocalChatHistory();
            }

            // If no history, add welcome message
            if (chatHistory.length === 0) {
                const welcomeMessage: ChatMessage = {
                    content: "Hello! I'm your AI financial assistant. How can I help you with your finances today?",
                    sender: 'assistant',
                    timestamp: new Date().toISOString()
                };

                setMessages([welcomeMessage]);

                if (user?.id) {
                    await ChatHistoryModel.addChatMessage(
                        welcomeMessage.content,
                        welcomeMessage.sender
                    );
                } else {
                    const localMessages = [welcomeMessage];
                    ChatHistoryModel.saveLocalChatHistory(localMessages);
                }
            } else {
                setMessages(chatHistory);
            }
        } catch (error: any) {
            console.error('Error loading chat history:', error);
            setError('Failed to load chat history. Please try refreshing the page.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (inputMessage.trim() === '') return;

        // Add user message to chat
        const userMessage: ChatMessage = {
            content: inputMessage,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        // Update messages with the new user message
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputMessage('');
        setLoading(true);

        try {
            // Save user message to storage
            if (user?.id) {
                await ChatHistoryModel.addChatMessage(userMessage.content, userMessage.sender);
            } else {
                // Save current state of messages plus the new message
                ChatHistoryModel.saveLocalChatHistory(updatedMessages);
            }

            // Generate AI response
            const response = generateAIResponse(inputMessage);
            const aiMessage: ChatMessage = {
                content: response,
                sender: 'assistant',
                timestamp: new Date().toISOString()
            };

            // Update messages with both the user message and AI response
            const finalMessages = [...updatedMessages, aiMessage];
            setMessages(finalMessages);

            // Save AI response to storage
            if (user?.id) {
                await ChatHistoryModel.addChatMessage(aiMessage.content, aiMessage.sender);
            } else {
                // Important: Always use the most current state to save to localStorage
                ChatHistoryModel.saveLocalChatHistory(finalMessages);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm('Are you sure you want to clear all chat history?')) {
            try {
                if (user?.id) {
                    const { success, error } = await ChatHistoryModel.clearChatHistory();
                    if (!success && error) {
                        throw new Error(error);
                    }
                } else {
                    ChatHistoryModel.saveLocalChatHistory([]);
                }

                // Add welcome message back
                const welcomeMessage: ChatMessage = {
                    content: "Hello! I'm your AI financial assistant. How can I help you with your finances today?",
                    sender: 'assistant',
                    timestamp: new Date().toISOString()
                };

                setMessages([welcomeMessage]);

                if (user?.id) {
                    await ChatHistoryModel.addChatMessage(welcomeMessage.content, welcomeMessage.sender);
                } else {
                    ChatHistoryModel.saveLocalChatHistory([welcomeMessage]);
                }
            } catch (error: any) {
                console.error('Error clearing chat history:', error);
                setError('Failed to clear chat history. Please try again.');
            }
        }
    };

    const generateAIResponse = (query: string) => {
        const lowerCaseQuery = query.toLowerCase().trim();

        // Get all the previous user messages for context
        const userMessageHistory = messages
            .filter(msg => msg.sender === 'user')
            .map(msg => msg.content);

        // Get the previous bot messages for context
        const botMessageHistory = messages
            .filter(msg => msg.sender === 'assistant')
            .map(msg => msg.content);

        // Get the most recent messages (from both user and assistant) for better context
        const recentConversation = messages.slice(-4);

        // Get specifically the last user message before this one
        const previousUserMessage = userMessageHistory.length > 1 ?
            userMessageHistory[userMessageHistory.length - 2] : '';

        // Get specifically the last bot message
        const lastBotMessage = botMessageHistory.length > 0 ?
            botMessageHistory[botMessageHistory.length - 1] : '';

        // Form a conversation summary to help with context
        const conversationSummary = recentConversation.map(msg =>
            `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.content}`
        ).join('\n');

        console.log('Conversation context:', {
            previousUserMessage,
            lastBotMessage,
            messageCount: messages.length,
            userMessageCount: userMessageHistory.length,
            botMessageCount: botMessageHistory.length,
        });

        // Check if this is a follow-up question
        const isFollowUp = isFollowUpQuestion(query, userMessageHistory);

        // Get last 3 months of financial data
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        // Pass the date range to getTransactionSummary for proper filtering
        const summary = getTransactionSummary(threeMonthsAgo, today);

        console.log('Transaction summary from context:', summary);

        // Fix: properly detect if we have transaction data
        // Checking absolute values since expenses might be negative
        const hasTransactionData = Math.abs(summary.totalIncome) > 0 || Math.abs(summary.totalExpense) > 0;

        // If expense amounts are already negative, we need to adjust our calculation
        // Check for typical expense categorization patterns
        let correctedSummary;

        // Determine how expenses are stored based on the transaction model
        // If totalExpense is negative, expenses are stored as negative values (the amount in the transaction)
        // If totalExpense is positive, expenses are already properly calculated (using Math.abs in getTransactionSummary)
        if (summary.totalExpense < 0) {
            // Case 1: Expenses are stored as negative numbers
            // In this case, the netSavings should be income + expenses (since expenses are already negative)
            const netSavings = summary.totalIncome + summary.totalExpense;

            // Correct the total expense to be positive for display purposes
            correctedSummary = {
                ...summary,
                totalExpense: Math.abs(summary.totalExpense),
                netSavings: netSavings
            };

            console.log('Corrected summary (expenses were negative):', correctedSummary);
        } else {
            // Case 2: Expenses are stored as positive numbers and netSavings calculation is already correct
            correctedSummary = summary;
            console.log('Using original summary (expenses were positive):', correctedSummary);
        }

        // Use the corrected summary from now on
        const finalSummary = correctedSummary;

        console.log('Query analysis:', {
            query,
            previousUserMessage,
            isFollowUp,
            hasTransactionData,
            finalSummary
        });

        // If we don't have transaction data, give different responses
        if (!hasTransactionData) {
            if (lowerCaseQuery.includes('hello') || lowerCaseQuery.includes('hi') || lowerCaseQuery.includes('hey')) {
                return `Hello! I'm your financial assistant. I can help you understand your spending patterns, savings rate, and provide financial insights. How can I assist you today?`;
            }

            if (lowerCaseQuery.includes('loss') || lowerCaseQuery.includes('profit')) {
                return `I don't see any transaction data yet, so I can't determine if you're in a profit or loss situation. Try adding your income and expenses first, then I can analyze your financial position.`;
            }

            if (lowerCaseQuery.includes('tell me more') || lowerCaseQuery.includes('more detail') || lowerCaseQuery.includes('elaborate')) {
                // Check the last bot message to determine the context
                if (lastBotMessage.toLowerCase().includes('transaction')) {
                    return `To add transactions, click on the "Add Transaction" menu item. Enter the date, amount, category, and other details. For income, use positive amounts, and for expenses, you can use either negative amounts or select "Expense" as the category. Once you've added some transactions, I can provide personalized financial insights.`;
                } else {
                    return `To provide detailed financial insights, I'll need some transaction data to analyze. Once you've added some transactions, I can tell you about your spending patterns, saving rate, and offer personalized advice.`;
                }
            }

            if (lowerCaseQuery.includes('transaction')) {
                return `I don't see any transactions in your account yet. To get started, go to the "Add Transaction" page and enter your income and expenses. Once you've added some data, I can provide meaningful insights.`;
            }

            if (lowerCaseQuery.includes('income') || lowerCaseQuery.includes('earn')) {
                return `There's no income data recorded yet. To track your income, add transactions with the "Income" category. You can specify different income sources like "Salary", "Freelance", or "Investments" as subcategories.`;
            }

            if (lowerCaseQuery.includes('expense') || lowerCaseQuery.includes('spend')) {
                return `There's no expense data recorded yet. Start tracking your expenses by adding transactions with the "Expense" category. Categorizing your expenses (like "Food", "Housing", "Transportation") will help you understand your spending patterns better.`;
            }

            if (lowerCaseQuery.includes('save') || lowerCaseQuery.includes('saving')) {
                return `I don't have enough transaction data to calculate your savings rate. To track savings, add both your income and expense transactions. Your savings rate is the percentage of income that you're not spending.`;
            }

            if (lowerCaseQuery.includes('budget') || lowerCaseQuery.includes('spending')) {
                return `To create a budget, first add your income and expense transactions. This will help me analyze your spending patterns and suggest appropriate budget categories and limits based on your actual financial behavior.`;
            }

            // Randomize responses for no data to avoid repetition
            const noDataResponses = [
                "I don't see any transaction data yet. Would you like to add some transactions to get started with financial tracking?",
                "It looks like you haven't added any transactions yet. Adding your income and expenses will help me provide personalized financial insights.",
                "To give you meaningful financial advice, I'll need some transaction data to analyze. Would you like to know how to add transactions?"
            ];

            // Use query length to select a response (simple pseudorandom selection)
            return noDataResponses[query.length % noDataResponses.length];
        }

        // Standard intents for when we have data
        if (lowerCaseQuery.includes('hello') || lowerCaseQuery.includes('hi') || lowerCaseQuery.includes('hey')) {
            return `Hello! I'm your financial assistant. I can help you understand your spending patterns, savings rate, and provide financial insights. How can I assist you today?`;
        }

        if (lowerCaseQuery.includes('save') || lowerCaseQuery.includes('saving')) {
            const savingsRate = finalSummary.totalIncome > 0 ? (finalSummary.netSavings / finalSummary.totalIncome) * 100 : 0;
            return `Based on your transaction history, your savings rate is ${savingsRate.toFixed(1)}%. ${parseFloat(savingsRate.toFixed(1)) >= 20
                ? "That's excellent! Financial experts recommend saving at least 20% of your income."
                : "Financial experts recommend saving at least 20% of your income. Consider reviewing your expenses to increase your savings rate."
                }`;
        }

        if (lowerCaseQuery.includes('budget') || lowerCaseQuery.includes('spending')) {
            // Find top 3 expense categories
            const categories = Object.entries(finalSummary.categoryBreakdown)
                .filter(([_, amount]) => (amount as number) > 0)
                .sort(([_, a], [__, b]) => (b as number) - (a as number))
                .slice(0, 3);

            if (categories.length > 0) {
                const categoryList = categories
                    .map(([category, amount]) => `${category}: $${(amount as number).toFixed(2)}`)
                    .join(', ');

                return `Your top spending categories are ${categoryList}. Consider setting budget limits for these categories to better manage your finances.`;
            } else {
                return `I don't see any significant spending categories in your recent transactions. Start tracking your expenses consistently to get better insights.`;
            }
        }

        if (lowerCaseQuery.includes('income') || lowerCaseQuery.includes('earn')) {
            return `Over the past 3 months, your total income was $${finalSummary.totalIncome.toFixed(2)}. Your average monthly income is $${(finalSummary.totalIncome / 3).toFixed(2)}.`;
        }

        if (lowerCaseQuery.includes('expense') || lowerCaseQuery.includes('spend')) {
            return `Over the past 3 months, your total expenses were $${finalSummary.totalExpense.toFixed(2)}. Your average monthly spending is $${(finalSummary.totalExpense / 3).toFixed(2)}.`;
        }

        if (lowerCaseQuery.includes('invest') || lowerCaseQuery.includes('investment')) {
            const savingsRate = finalSummary.totalIncome > 0 ? (finalSummary.netSavings / finalSummary.totalIncome) * 100 : 0;
            return `If you're interested in investing, a general rule is to first build an emergency fund of 3-6 months of expenses, then consider low-cost index funds for long-term growth. Based on your savings rate of ${savingsRate.toFixed(1)}%, ${finalSummary.netSavings > 0
                ? "you appear to have some capacity for investing."
                : "you may want to focus on increasing your savings before investing."
                }`;
        }

        // Handle questions about financial status (profit/loss)
        if (lowerCaseQuery.includes('loss') || lowerCaseQuery.includes('profit')) {
            if (finalSummary.netSavings > 0) {
                return `Based on your transactions, you're in a positive financial position with net savings of $${finalSummary.netSavings.toFixed(2)}. Your income ($${finalSummary.totalIncome.toFixed(2)}) exceeds your expenses ($${finalSummary.totalExpense.toFixed(2)}), which is great!`;
            } else if (finalSummary.netSavings < 0) {
                return `Currently, your expenses ($${finalSummary.totalExpense.toFixed(2)}) exceed your income ($${finalSummary.totalIncome.toFixed(2)}) by $${Math.abs(finalSummary.netSavings).toFixed(2)}. This means you're in a deficit position. Consider reviewing your budget to find areas where you can cut back.`;
            } else {
                return `Your income and expenses are exactly balanced (both $${finalSummary.totalIncome.toFixed(2)}). While you're not in a loss, you're also not saving anything. Consider reducing some expenses to build savings.`;
            }
        }

        // Handle "tell me more" types of questions
        if ((lowerCaseQuery.includes('tell me more') ||
            lowerCaseQuery.includes('more detail') ||
            lowerCaseQuery.includes('elaborate'))) {

            if (!hasTransactionData) {
                return `To provide detailed financial insights, I'll need some transaction data to analyze. Once you've added some transactions, I can tell you about your spending patterns, saving rate, and offer personalized advice.`;
            }

            // Determine what the previous conversation was about by checking the last bot message
            // This is better than checking the user message because the bot response indicates what topic was discussed
            if (lastBotMessage.toLowerCase().includes('income')) {
                return `Your income breakdown shows a total of $${finalSummary.totalIncome.toFixed(2)} over the past 3 months. To increase your income, consider exploring side gigs, asking for a raise, or developing skills that can lead to higher-paying opportunities.`;
            }
            else if (lastBotMessage.toLowerCase().includes('expense')) {
                return `Looking at your expense details, you've spent $${finalSummary.totalExpense.toFixed(2)} in the last 3 months. The most effective way to reduce expenses is usually to focus on your largest spending categories first, as they provide the biggest opportunities for savings.`;
            }
            else if (lastBotMessage.toLowerCase().includes('saving') || lastBotMessage.toLowerCase().includes('save')) {
                return `To improve your savings, consider implementing the 50/30/20 rule: allocate 50% of your income to needs, 30% to wants, and 20% to savings. Automating your savings through scheduled transfers can also help make saving more consistent.`;
            }
            else if (lastBotMessage.toLowerCase().includes('budget') || lastBotMessage.toLowerCase().includes('spend')) {
                // Get top spending categories for more specific advice
                const categories = Object.entries(finalSummary.categoryBreakdown)
                    .filter(([_, amount]) => (amount as number) < 0) // Negative amounts are expenses
                    .sort(([_, a], [__, b]) => (a as number) - (b as number)) // Sort ascending to get most negative first
                    .slice(0, 3)
                    .map(([category, amount]) => `${category}: $${Math.abs(amount as number).toFixed(2)}`);

                if (categories.length > 0) {
                    return `Your highest expense categories are ${categories.join(', ')}. To improve your budget, consider setting specific spending limits for each category and tracking your progress weekly.`;
                } else {
                    return `To create an effective budget, first categorize your expenses, then set realistic spending limits for each category. Many experts recommend the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.`;
                }
            }
            else {
                // General elaboration about financial status
                return `Your current financial snapshot shows income of $${finalSummary.totalIncome.toFixed(2)}, expenses of $${finalSummary.totalExpense.toFixed(2)}, and net savings of $${finalSummary.netSavings.toFixed(2)}. A healthy financial position typically includes an emergency fund of 3-6 months of expenses, a savings rate of at least 20%, and manageable debt levels.`;
            }
        }

        // For default response, randomize to avoid repetition
        const defaultResponses = [
            `I analyzed your recent transactions (income: $${finalSummary.totalIncome.toFixed(2)}, expenses: $${finalSummary.totalExpense.toFixed(2)}). Your net savings are $${finalSummary.netSavings.toFixed(2)}. How else can I help you understand your finances?`,
            `Looking at your financial data, you have income of $${finalSummary.totalIncome.toFixed(2)} and expenses of $${finalSummary.totalExpense.toFixed(2)}. Would you like specific advice about budgeting, saving, or investing?`,
            `Your financial summary shows $${finalSummary.totalIncome.toFixed(2)} in income and $${finalSummary.totalExpense.toFixed(2)} in expenses. Is there a particular aspect of your finances you'd like to improve?`
        ];

        return defaultResponses[query.length % defaultResponses.length];
    };

    // Check if the current query is a follow-up to the previous conversation
    const isFollowUpQuestion = (query: string, previousMessages: string[]): boolean => {
        if (previousMessages.length === 0) return false;

        const followUpIndicators = [
            'what about', 'how about', 'and', 'also', 'why', 'how', 'what else',
            'can you', 'could you', 'please', 'then', 'so', 'actually'
        ];

        // Check if query starts with any follow-up indicators
        const lowerCaseQuery = query.toLowerCase().trim();

        // Check for pronouns that might indicate a follow-up
        if (/^(it|this|that|these|those|they)\b/i.test(lowerCaseQuery)) {
            return true;
        }

        // Check for other follow-up markers
        return followUpIndicators.some(indicator =>
            lowerCaseQuery.startsWith(indicator) ||
            lowerCaseQuery.includes(` ${indicator} `)
        );
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Box>
            <Paper elevation={3} sx={{ p: 0, mb: 4, borderRadius: 3, height: '70vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SmartToyIcon sx={{ mr: 1.5, fontSize: 24 }} />
                        <Typography variant="h6" component="h1" fontWeight="600">
                            Financial Assistant Chat
                        </Typography>
                    </Box>
                    <Tooltip title="Clear chat history">
                        <IconButton
                            color="inherit"
                            onClick={handleClearHistory}
                            sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Chat Messages */}
                <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto', bgcolor: '#f5f7f9' }}>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            onClose={() => setError(null)}
                        >
                            {error}
                        </Alert>
                    )}

                    {historyLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress size={40} />
                        </Box>
                    ) : (
                        <List>
                            {messages.map((message, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                        mb: 2,
                                        p: 0
                                    }}
                                >
                                    <Box sx={{ display: 'flex', maxWidth: '80%' }}>
                                        {message.sender === 'assistant' && (
                                            <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                                                <SmartToyIcon />
                                            </Avatar>
                                        )}
                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: message.sender === 'user' ? 'primary.light' : 'white',
                                                color: message.sender === 'user' ? 'white' : 'text.primary',
                                                borderRadius: 2,
                                                boxShadow: 1
                                            }}
                                        >
                                            <Typography variant="body1">{message.content}</Typography>
                                        </Box>
                                        {message.sender === 'user' && (
                                            <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>
                                                <AccountCircleIcon />
                                            </Avatar>
                                        )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </ListItem>
                            ))}
                            {loading && (
                                <ListItem
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        mb: 2,
                                        p: 0
                                    }}
                                >
                                    <Box sx={{ display: 'flex' }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                                            <SmartToyIcon />
                                        </Avatar>
                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: 'white',
                                                borderRadius: 2,
                                                boxShadow: 1,
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            <Typography variant="body2">Thinking...</Typography>
                                        </Box>
                                    </Box>
                                </ListItem>
                            )}
                            <div ref={messagesEndRef} />
                        </List>
                    )}
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Ask about your finances..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading || historyLoading}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        color="primary"
                                        onClick={handleSendMessage}
                                        disabled={loading || historyLoading || inputMessage.trim() === ''}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ bgcolor: 'background.paper' }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default AIFinancialAssistant; 