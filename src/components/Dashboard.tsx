import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    useTheme,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';
import InfoIcon from '@mui/icons-material/Info';
import { useTransactions } from '../context/TransactionContext';
import TransactionChart from './TransactionChart';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [monthlyData, setMonthlyData] = useState({
        income: 0,
        expense: 0,
        savings: 0,
        savingsRate: 0
    });

    const [yearlyData, setYearlyData] = useState({
        income: 0,
        expense: 0,
        savings: 0,
        savingsRate: 0
    });

    const { getTransactionsByDateRange, getTransactionSummary, refreshTransactions } = useTransactions();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Dashboard mounted or user changed, refreshing transactions');
        // Force refresh transactions when the dashboard loads
        refreshTransactions().catch(err => {
            console.error('Error refreshing transactions on Dashboard mount:', err);
            setError('Failed to load your transactions. Please try again later.');
        }).finally(() => {
            setLoading(false);
        });
    }, [refreshTransactions]);

    useEffect(() => {
        // Calculate monthly data (current month)
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const monthlySummary = getTransactionSummary(firstDayOfMonth, lastDayOfMonth);
        const monthlySavingsRate = monthlySummary.totalIncome > 0
            ? (monthlySummary.netSavings / monthlySummary.totalIncome) * 100
            : 0;

        setMonthlyData({
            income: monthlySummary.totalIncome,
            expense: monthlySummary.totalExpense,
            savings: monthlySummary.netSavings,
            savingsRate: monthlySavingsRate
        });

        // Calculate yearly data (current year)
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const lastDayOfYear = new Date(today.getFullYear(), 11, 31);

        const yearlySummary = getTransactionSummary(firstDayOfYear, lastDayOfYear);
        const yearlySavingsRate = yearlySummary.totalIncome > 0
            ? (yearlySummary.netSavings / yearlySummary.totalIncome) * 100
            : 0;

        setYearlyData({
            income: yearlySummary.totalIncome,
            expense: yearlySummary.totalExpense,
            savings: yearlySummary.netSavings,
            savingsRate: yearlySavingsRate
        });

        // Debug logging
        console.log('Dashboard data:', {
            monthlyData: {
                income: monthlySummary.totalIncome,
                expense: monthlySummary.totalExpense,
                savings: monthlySummary.netSavings,
            },
            yearlyData: {
                income: yearlySummary.totalIncome,
                expense: yearlySummary.totalExpense,
                savings: yearlySummary.netSavings,
            }
        });
    }, [getTransactionSummary, getTransactionsByDateRange]);

    // Get transactions for chart display
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    const transactions = getTransactionsByDateRange(sixMonthsAgo, today);
    const summary = getTransactionSummary(sixMonthsAgo, today);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading your financial data...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ ml: 2 }}
                        onClick={() => {
                            setError(null);
                            refreshTransactions();
                        }}
                    >
                        Try Again
                    </Button>
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Paper
                elevation={2}
                sx={{
                    p: { xs: 3, sm: 4 },
                    mb: 4,
                    textAlign: 'center',
                    background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                    Financial Dashboard
                </Typography>
                <Typography variant="subtitle1">
                    Your personal finance overview at a glance
                </Typography>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Monthly Summary Cards */}
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                        This Month's Overview
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={2}
                        sx={{
                            height: '100%',
                            border: `1px solid ${theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)'}`
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Income
                                </Typography>
                                <TrendingUpIcon
                                    color="success"
                                    fontSize="medium"
                                    sx={{ bgcolor: 'success.light', p: 0.5, borderRadius: '50%', color: 'white' }}
                                />
                            </Box>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                ${monthlyData.income.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={2}
                        sx={{
                            height: '100%',
                            border: `1px solid ${theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)'}`
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Expenses
                                </Typography>
                                <TrendingDownIcon
                                    color="error"
                                    fontSize="medium"
                                    sx={{ bgcolor: 'error.light', p: 0.5, borderRadius: '50%', color: 'white' }}
                                />
                            </Box>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                ${monthlyData.expense.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={2}
                        sx={{
                            height: '100%',
                            border: `1px solid ${theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)'}`
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Savings
                                </Typography>
                                <SavingsIcon
                                    color={monthlyData.savings >= 0 ? 'success' : 'error'}
                                    fontSize="medium"
                                    sx={{
                                        bgcolor: monthlyData.savings >= 0 ? 'success.light' : 'error.light',
                                        p: 0.5,
                                        borderRadius: '50%',
                                        color: 'white'
                                    }}
                                />
                            </Box>
                            <Typography
                                variant="h5"
                                component="div"
                                sx={{
                                    fontWeight: 'bold',
                                    color: monthlyData.savings >= 0 ? 'success.main' : 'error.main'
                                }}
                            >
                                ${monthlyData.savings.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={2}
                        sx={{
                            height: '100%',
                            border: `1px solid ${theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)'}`
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Savings Rate
                                </Typography>
                                <Tooltip title="Percentage of income saved">
                                    <IconButton size="small">
                                        <InfoIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Typography
                                variant="h5"
                                component="div"
                                sx={{
                                    fontWeight: 'bold',
                                    color: monthlyData.savingsRate >= 20
                                        ? 'success.main'
                                        : monthlyData.savingsRate >= 0
                                            ? 'warning.main'
                                            : 'error.main'
                                }}
                            >
                                {monthlyData.savingsRate.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Yearly Summary Cards */}
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                        Year to Date Performance
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        January 1, {new Date().getFullYear()} - December 31, {new Date().getFullYear()}
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={2}
                        sx={{
                            height: '100%',
                            border: `1px solid ${theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)'}`
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Total Income
                                </Typography>
                                <TrendingUpIcon
                                    color="success"
                                    fontSize="medium"
                                    sx={{ bgcolor: 'success.light', p: 0.5, borderRadius: '50%', color: 'white' }}
                                />
                            </Box>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                ${yearlyData.income.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={2}
                        sx={{
                            height: '100%',
                            border: `1px solid ${theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)'}`
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Total Expenses
                                </Typography>
                                <TrendingDownIcon
                                    color="error"
                                    fontSize="medium"
                                    sx={{ bgcolor: 'error.light', p: 0.5, borderRadius: '50%', color: 'white' }}
                                />
                            </Box>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                ${yearlyData.expense.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={2}
                        sx={{
                            height: '100%',
                            border: `1px solid ${theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)'}`
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Net Savings
                                </Typography>
                                <AccountBalanceWalletIcon
                                    color={yearlyData.savings >= 0 ? 'success' : 'error'}
                                    fontSize="medium"
                                    sx={{
                                        bgcolor: yearlyData.savings >= 0 ? 'success.light' : 'error.light',
                                        p: 0.5,
                                        borderRadius: '50%',
                                        color: 'white'
                                    }}
                                />
                            </Box>
                            <Typography
                                variant="h5"
                                component="div"
                                sx={{
                                    fontWeight: 'bold',
                                    color: yearlyData.savings >= 0 ? 'success.main' : 'error.main'
                                }}
                            >
                                ${yearlyData.savings.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={2}
                        sx={{
                            height: '100%',
                            border: `1px solid ${theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)'}`
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Annual Savings Rate
                                </Typography>
                                <Tooltip title="Target: 20% or more for financial health">
                                    <IconButton size="small">
                                        <InfoIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Typography
                                variant="h5"
                                component="div"
                                sx={{
                                    fontWeight: 'bold',
                                    color: yearlyData.savingsRate >= 20
                                        ? 'success.main'
                                        : yearlyData.savingsRate >= 0
                                            ? 'warning.main'
                                            : 'error.main'
                                }}
                            >
                                {yearlyData.savingsRate.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Transaction History Chart */}
            <Grid item xs={12}>
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.03)'}`
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <div>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Transaction History (Last 6 Months)
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {sixMonthsAgo.toLocaleDateString()} - {today.toLocaleDateString()}
                            </Typography>
                        </div>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate('/transactions')}
                        >
                            View All
                        </Button>
                    </Box>

                    {transactions.length > 0 ? (
                        <TransactionChart
                            transactions={transactions}
                            categoryBreakdown={summary.categoryBreakdown}
                        />
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 5
                        }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                No transaction data available for the selected period.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/add-transaction')}
                            >
                                Add Your First Transaction
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Box>
    );
};

export default Dashboard; 