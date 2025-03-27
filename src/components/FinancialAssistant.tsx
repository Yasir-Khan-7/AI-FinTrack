import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Button,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    Alert,
    Collapse,
    IconButton,
    Grow,
    Fade
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CloseIcon from '@mui/icons-material/Close';
import { useTransactions } from '../context/TransactionContext';

const FinancialAssistant: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);
    const { transactions, getTransactionSummary } = useTransactions();

    const generateSuggestions = async () => {
        setLoading(true);
        setError(null);

        try {
            // Prepare transaction data
            const lastThreeMonths = new Date();
            lastThreeMonths.setMonth(lastThreeMonths.getMonth() - 3);

            const summary = getTransactionSummary(lastThreeMonths, new Date());

            if (transactions.length === 0) {
                setError("Please add some transactions before generating insights.");
                setLoading(false);
                return;
            }

            // Format transaction data to send to Groq
            const transactionData = {
                totalIncome: summary.totalIncome,
                totalExpense: summary.totalExpense,
                netSavings: summary.netSavings,
                categories: summary.categoryBreakdown,
                recentTransactions: transactions.slice(-10)
            };

            // API request to Groq
            try {
                const response = await fetch('/api/financial-assistant', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ transactionData }),
                });

                let data;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        console.error('Error parsing JSON:', jsonError);
                        throw new Error('Invalid response format from server');
                    }
                } else {
                    const text = await response.text();
                    console.error('Non-JSON response:', text.substring(0, 100));
                    throw new Error('Server responded with non-JSON data');
                }

                if (!response.ok) {
                    throw new Error(data?.error || `Server error: ${response.status}`);
                }

                if (!data?.suggestions || data.suggestions.length === 0) {
                    throw new Error('No suggestions were generated');
                }

                setSuggestions(data.suggestions);
                // Automatically expand when suggestions are loaded
                setExpanded(true);
            } catch (apiError: any) {
                console.error('API error:', apiError);
                setError(`${apiError.message || 'Network error when connecting to AI service'}. Please try again later.`);
            }
        } catch (err: any) {
            console.error('Error generating suggestions:', err);
            setError(`${err.message || 'Failed to generate suggestions'}. Please try again later.`);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpanded = () => {
        setExpanded(prev => !prev);
    };

    const clearSuggestions = () => {
        setSuggestions([]);
        setError(null);
    };

    // If there are no transactions, don't show the assistant
    if (transactions.length === 0) {
        return null;
    }

    return (
        <Grow in={true}>
            <Paper
                elevation={4}
                sx={{
                    position: 'sticky',
                    top: 16,
                    zIndex: 1100,
                    width: '100%',
                    borderRadius: '12px',
                    mb: 3,
                    overflow: 'hidden',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: expanded
                        ? '0 8px 16px rgba(0, 0, 0, 0.1)'
                        : '0 4px 8px rgba(0, 0, 0, 0.06)'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: 'primary.light',
                        color: 'white',
                        '&:hover': {
                            bgcolor: 'primary.main',
                        }
                    }}
                    onClick={toggleExpanded}
                >
                    <LightbulbIcon sx={{ mr: 1.5 }} />
                    <Typography variant="subtitle1" fontWeight="600" sx={{ flexGrow: 1 }}>
                        Financial Insights AI Assistant
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            clearSuggestions();
                        }}
                        sx={{
                            color: 'white',
                            opacity: 0.7,
                            '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.15)' },
                            mr: 1
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded();
                        }}
                        sx={{
                            color: 'white',
                            opacity: 0.7,
                            '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.15)' }
                        }}
                    >
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Get personalized financial insights and suggestions based on your transaction history.
                        </Typography>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 2 }}
                                action={
                                    <IconButton
                                        color="inherit"
                                        size="small"
                                        onClick={() => setError(null)}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                {error}
                            </Alert>
                        )}

                        {suggestions.length === 0 && (
                            <Button
                                variant="contained"
                                onClick={generateSuggestions}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <SmartToyIcon />}
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                {loading ? 'Analyzing your data...' : 'Get Financial Insights'}
                            </Button>
                        )}

                        {suggestions.length > 0 && (
                            <Fade in={true}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                        Your Personalized Suggestions:
                                    </Typography>
                                    <List sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 1 }}>
                                        {suggestions.map((suggestion, index) => (
                                            <ListItem
                                                key={index}
                                                alignItems="flex-start"
                                                sx={{
                                                    px: 1,
                                                    borderBottom: index < suggestions.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                                                    py: 1.5
                                                }}
                                            >
                                                <Chip
                                                    size="small"
                                                    label={index + 1}
                                                    color="primary"
                                                    sx={{ mr: 1.5, mt: 0.5 }}
                                                />
                                                <ListItemText
                                                    primary={suggestion}
                                                    primaryTypographyProps={{
                                                        variant: "body2",
                                                        color: "text.primary"
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={generateSuggestions}
                                            disabled={loading}
                                            sx={{ mr: 1 }}
                                        >
                                            {loading ? <CircularProgress size={16} /> : 'Refresh'}
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="text"
                                            color="inherit"
                                            onClick={clearSuggestions}
                                        >
                                            Clear
                                        </Button>
                                    </Box>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                </Collapse>
            </Paper>
        </Grow>
    );
};

export default FinancialAssistant; 