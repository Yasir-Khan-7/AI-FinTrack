import React, { useState } from 'react';
import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton, Grid, useMediaQuery, useTheme } from '@mui/material';
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

// Define colors for subcategories
const subcategoryColors: { [key: string]: string } = {
    // Income
    'Salary': 'rgba(75, 192, 192, 0.7)',
    'Freelance': 'rgba(66, 170, 170, 0.7)',
    'Investments': 'rgba(57, 148, 148, 0.7)',
    'Other Income': 'rgba(48, 126, 126, 0.7)',

    // Expenses
    'Housing': 'rgba(255, 99, 132, 0.7)',
    'Food': 'rgba(240, 85, 118, 0.7)',
    'Transportation': 'rgba(225, 71, 104, 0.7)',
    'Utilities': 'rgba(210, 57, 90, 0.7)',
    'Healthcare': 'rgba(195, 43, 76, 0.7)',
    'Entertainment': 'rgba(180, 29, 62, 0.7)',
    'Shopping': 'rgba(165, 15, 48, 0.7)',
    'Debt Payments': 'rgba(150, 10, 34, 0.7)',
    'Other Expense': 'rgba(135, 5, 20, 0.7)',
};

// Function to generate random colors for subcategories without defined colors
const getRandomColor = (): string => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
};

interface TransactionChartProps {
    transactions: Transaction[];
    categoryBreakdown: {
        [key: string]: number;
    };
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: isMobile ? 'bottom' as const : 'top' as const,
                labels: {
                    boxWidth: isMobile ? 10 : 40,
                    font: {
                        size: isMobile ? 10 : 12
                    }
                }
            },
            title: {
                display: true,
                text: 'Income vs Expense Over Time',
                font: {
                    size: isMobile ? 14 : 16
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: !isMobile,
                    text: 'Amount ($)'
                },
                ticks: {
                    font: {
                        size: isMobile ? 10 : 12
                    }
                }
            },
            x: {
                title: {
                    display: !isMobile,
                    text: 'Date'
                },
                ticks: {
                    font: {
                        size: isMobile ? 10 : 12
                    },
                    maxRotation: isMobile ? 45 : 0
                }
            }
        }
    };

    const categoryChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: isMobile ? 'bottom' as const : 'right' as const,
                labels: {
                    boxWidth: isMobile ? 10 : 40,
                    font: {
                        size: isMobile ? 10 : 12
                    }
                }
            },
            title: {
                display: true,
                text: 'Spending by Category',
                font: {
                    size: isMobile ? 14 : 16
                }
            },
        }
    };

    return (
        <Paper elevation={3} sx={{ p: isMobile ? 2 : 3, mb: 3 }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Financial Analysis
                </Typography>
                <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={handleChartTypeChange}
                    aria-label="chart type"
                    size="small"
                    sx={{
                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                        '& .MuiToggleButton-root': {
                            padding: isMobile ? '4px 8px' : undefined,
                            fontSize: isMobile ? '0.75rem' : undefined
                        }
                    }}
                >
                    <ToggleButton value="line" aria-label="line chart">
                        LINE
                    </ToggleButton>
                    <ToggleButton value="bar" aria-label="bar chart">
                        BAR
                    </ToggleButton>
                    <ToggleButton value="pie" aria-label="pie chart">
                        PIE
                    </ToggleButton>
                    <ToggleButton value="doughnut" aria-label="doughnut chart">
                        DOUGHNUT
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={chartType === 'line' || chartType === 'bar' ? 12 : 6}>
                    {chartType === 'line' && (
                        <Box sx={{ height: isMobile ? 300 : 400 }}>
                            <Line options={timeChartOptions} data={timeChartData} />
                        </Box>
                    )}
                    {chartType === 'bar' && (
                        <Box sx={{ height: isMobile ? 300 : 400 }}>
                            <Bar options={timeChartOptions} data={timeChartData} />
                        </Box>
                    )}
                    {chartType === 'pie' && (
                        <Box sx={{ height: isMobile ? 250 : 400 }}>
                            <Pie options={categoryChartOptions} data={categoryChartData} />
                        </Box>
                    )}
                    {chartType === 'doughnut' && (
                        <Box sx={{ height: isMobile ? 250 : 400 }}>
                            <Doughnut options={categoryChartOptions} data={categoryChartData} />
                        </Box>
                    )}
                </Grid>

                {(chartType === 'pie' || chartType === 'doughnut') && (
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            Breakdown by Category
                        </Typography>
                        <Box sx={{ maxHeight: isMobile ? 200 : 350, overflow: 'auto' }}>
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
                                                width: isMobile ? 12 : 16,
                                                height: isMobile ? 12 : 16,
                                                borderRadius: '50%',
                                                backgroundColor: subcategoryColors[subcategory] || getRandomColor(),
                                                mr: 1
                                            }}
                                        />
                                        <Typography variant={isMobile ? "caption" : "body2"}>{subcategory}</Typography>
                                    </Box>
                                    <Typography variant={isMobile ? "caption" : "body2"} sx={{ fontWeight: 'bold' }}>
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