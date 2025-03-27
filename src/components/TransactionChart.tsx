import React, { useState } from 'react';
import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton, Grid } from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    ChartOptions
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Transaction } from '../types';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

// Generate random color
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// Generate color palette for subcategories
const subcategoryColors: Record<string, string> = {
    // Income subcategories
    'Salary': '#4caf50',
    'Freelance': '#81c784',
    'Investments': '#66bb6a',
    'Gifts': '#a5d6a7',
    'Refunds': '#c8e6c9',
    'Business': '#2e7d32',
    'Other': '#e8f5e9',

    // Expense subcategories
    'Food & Dining': '#f44336',
    'Shopping': '#e57373',
    'Housing': '#ef5350',
    'Transportation': '#f44336',
    'Entertainment': '#e53935',
    'Healthcare': '#d32f2f',
    'Personal Care': '#c62828',
    'Education': '#b71c1c',
    'Travel': '#ef9a9a',
    'Utilities': '#ffcdd2',
    'Insurance': '#ffebee',
    'Debt Payments': '#d50000',
    'Savings & Investments': '#ff8a80',
    'Gifts & Donations': '#ff5252',
};

interface TransactionChartProps {
    transactions: Transaction[];
    categoryBreakdown: Record<string, number>;
}

// Get unique dates from transactions and sort them
const getUniqueDates = (transactions: Transaction[]): string[] => {
    const dates = Array.from(new Set(transactions.map(t => t.date)));
    return dates.sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('-').map(Number);
        const [dayB, monthB, yearB] = b.split('-').map(Number);

        if (yearA !== yearB) return yearA - yearB;
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
    });
};

const TransactionChart: React.FC<TransactionChartProps> = ({ transactions, categoryBreakdown }) => {
    const [chartType, setChartType] = useState<string>('line');

    const handleChartTypeChange = (
        event: React.MouseEvent<HTMLElement>,
        newChartType: string | null
    ) => {
        if (newChartType !== null) {
            setChartType(newChartType);
        }
    };

    // Prepare data for line/bar chart (time-based)
    const dates = getUniqueDates(transactions);

    const incomeByDate = dates.map(date => {
        return transactions
            .filter(t => t.date === date && t.category === 'Income')
            .reduce((sum, t) => sum + t.amount, 0);
    });

    const expenseByDate = dates.map(date => {
        return transactions
            .filter(t => t.date === date && t.category === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);
    });

    const timeChartData = {
            labels: dates,
            datasets: [
                {
                    label: 'Income',
                data: incomeByDate,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4
                },
                {
                    label: 'Expense',
                data: expenseByDate,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4
            }
        ]
    };

    // Prepare data for pie/doughnut chart (category breakdown)
    const subcategories = Object.keys(categoryBreakdown);
    const subcategoryAmounts = Object.values(categoryBreakdown);

    const categoryChartData = {
        labels: subcategories,
            datasets: [
                {
                data: subcategoryAmounts,
                backgroundColor: subcategories.map(subcategory =>
                    subcategoryColors[subcategory] || getRandomColor()
                ),
                    borderWidth: 1
                }
            ]
        };

    // Shared chart options
    const timeChartOptions = {
                            responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Income vs Expense Over Time',
            },
        },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Amount ($)'
                                    }
            },
            x: {
                                    title: {
                                        display: true,
                    text: 'Date'
                }
            }
        }
    };

    const categoryChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            title: {
                display: true,
                text: 'Spending by Category',
            },
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Financial Analysis
                </Typography>
                <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={handleChartTypeChange}
                    aria-label="chart type"
                    size="small"
                >
                    <ToggleButton value="line" aria-label="line chart">
                        Line
                    </ToggleButton>
                    <ToggleButton value="bar" aria-label="bar chart">
                        Bar
                    </ToggleButton>
                    <ToggleButton value="pie" aria-label="pie chart">
                        Pie
                    </ToggleButton>
                    <ToggleButton value="doughnut" aria-label="doughnut chart">
                        Doughnut
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={chartType === 'line' || chartType === 'bar' ? 12 : 6}>
                    {chartType === 'line' && (
                        <Box sx={{ height: 400 }}>
                            <Line options={timeChartOptions} data={timeChartData} />
                        </Box>
                    )}
                    {chartType === 'bar' && (
                        <Box sx={{ height: 400 }}>
                            <Bar options={timeChartOptions} data={timeChartData} />
                        </Box>
                    )}
                    {chartType === 'pie' && (
                        <Box sx={{ height: 400 }}>
                            <Pie options={categoryChartOptions} data={categoryChartData} />
                        </Box>
                    )}
                    {chartType === 'doughnut' && (
                        <Box sx={{ height: 400 }}>
                            <Doughnut options={categoryChartOptions} data={categoryChartData} />
                        </Box>
                    )}
                </Grid>

                {(chartType === 'pie' || chartType === 'doughnut') && (
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            Breakdown by Category
                        </Typography>
                        <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
                            {subcategories.map((subcategory, index) => (
                                <Box
                                    key={subcategory}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 1,
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: '50%',
                                                backgroundColor: subcategoryColors[subcategory] || getRandomColor(),
                                                mr: 1
                                            }}
                                        />
                                        <Typography variant="body2">{subcategory}</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        ${categoryBreakdown[subcategory].toFixed(2)}
                                    </Typography>
                                </Box>
                            ))}
                </Box>
                    </Grid>
                )}
            </Grid>
            </Paper>
    );
};

export default TransactionChart; 