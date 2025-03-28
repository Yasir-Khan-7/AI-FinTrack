import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    TextField,
    IconButton,
    Tooltip,
    Stack,
    Divider,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTransactions } from '../context/TransactionContext';
import { Transaction } from '../types';
import TransactionChart from './TransactionChart';
import { useNavigate } from 'react-router-dom';

const TransactionList: React.FC = () => {
    // Set a more reasonable date range - current month by default
    const [startDate, setStartDate] = useState<Date | null>(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1); // First day of current month
    });
    const [endDate, setEndDate] = useState<Date | null>(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
    });
    const [showChart, setShowChart] = useState(false);
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [subcategoryFilter, setSubcategoryFilter] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const {
        getTransactionsByDateRange,
        getTransactionSummary,
        deleteTransaction,
        exportToCSV,
        refreshTransactions,
        addTransaction
    } = useTransactions();

    // Pre-defined date range options for quick selection
    const dateRangeOptions = [
        {
            label: 'This Month', getValue: () => {
                const today = new Date();
                return {
                    start: new Date(today.getFullYear(), today.getMonth(), 1),
                    end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
                };
            }
        },
        {
            label: 'Last Month', getValue: () => {
                const today = new Date();
                return {
                    start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                    end: new Date(today.getFullYear(), today.getMonth(), 0)
                };
            }
        },
        {
            label: 'Last 3 Months', getValue: () => {
                const today = new Date();
                return {
                    start: new Date(today.getFullYear(), today.getMonth() - 3, 1),
                    end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
                };
            }
        },
        {
            label: 'This Year', getValue: () => {
                const today = new Date();
                return {
                    start: new Date(today.getFullYear(), 0, 1),
                    end: new Date(today.getFullYear(), 11, 31)
                };
            }
        },
        {
            label: 'All Time', getValue: () => {
                return {
                    start: new Date(2000, 0, 1),
                    end: new Date(2099, 11, 31)
                };
            }
        }
    ];

    const handleDateRangeChange = (option: typeof dateRangeOptions[0]) => {
        const { start, end } = option.getValue();
        setStartDate(start);
        setEndDate(end);
    };

    // Refresh transactions when component mounts
    useEffect(() => {
        console.log('TransactionList component mounted, refreshing transactions');
        setLoading(true);
        setError(null);

        // Force a refresh regardless of any cached data
        refreshTransactions()
            .then(() => {
                console.log('Transactions successfully refreshed in TransactionList');
            })
            .catch(error => {
                console.error('Error refreshing transactions in TransactionList:', error);
                setError('Failed to load transactions. Please try again.');
            })
            .finally(() => {
                setLoading(false);
            });

        // Cleanup function to log when component unmounts
        return () => {
            console.log('TransactionList component unmounting');
        };
    }, []); // Empty dependency array means this only runs once when mounted

    // Refresh transactions when date range changes
    useEffect(() => {
        if (startDate && endDate) {
            console.log('Date range changed, refreshing transactions:', {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            // No need to refresh transactions from server again
            // Just filter the existing transactions with the new date range
            console.log('Filtering existing transactions with new date range');
        }
    }, [startDate, endDate]); // Only depends on date changes, not on refreshTransactions

    const transactions = startDate && endDate
        ? getTransactionsByDateRange(startDate, endDate)
        : [];

    // Apply filters
    const filteredTransactions = transactions.filter(transaction => {
        if (categoryFilter && transaction.category !== categoryFilter) {
            return false;
        }
        if (subcategoryFilter && transaction.subcategory !== subcategoryFilter) {
            return false;
        }
        return true;
    });

    const summary = startDate && endDate
        ? getTransactionSummary(startDate, endDate)
        : { totalIncome: 0, totalExpense: 0, netSavings: 0, categoryBreakdown: {} };

    const handleToggleChart = () => {
        setShowChart(prev => !prev);
    };

    const handleExportCSV = () => {
        if (startDate && endDate) {
            exportToCSV(startDate, endDate);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        setError(null);

        console.log('Manually refreshing transactions');

        refreshTransactions()
            .then(() => {
                console.log('Transactions manually refreshed successfully');
                // Display a temporary success message
                const alertElement = document.createElement('div');
                alertElement.className = 'refresh-success-alert';
                alertElement.textContent = 'Transactions refreshed successfully';
                alertElement.style.position = 'fixed';
                alertElement.style.top = '20px';
                alertElement.style.left = '50%';
                alertElement.style.transform = 'translateX(-50%)';
                alertElement.style.padding = '10px 20px';
                alertElement.style.backgroundColor = '#4caf50';
                alertElement.style.color = 'white';
                alertElement.style.borderRadius = '4px';
                alertElement.style.zIndex = '9999';

                document.body.appendChild(alertElement);

                setTimeout(() => {
                    document.body.removeChild(alertElement);
                }, 3000);
            })
            .catch(error => {
                console.error('Error manually refreshing transactions:', error);
                setError('Failed to refresh transactions. Please try again.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleFilterSelect = (type: 'category' | 'subcategory', value: string | null) => {
        if (type === 'category') {
            setCategoryFilter(value);
            setSubcategoryFilter(null); // Reset subcategory filter when changing category
        } else {
            setSubcategoryFilter(value);
        }
        handleFilterClose();
    };

    // Get unique categories and subcategories for filtering
    const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));
    const uniqueSubcategories = Array.from(new Set(transactions.map(t => t.subcategory)));

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2">
                    Transaction History
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Refresh">
                        <IconButton onClick={handleRefresh}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Filter">
                        <IconButton onClick={handleFilterClick}>
                            <FilterListIcon />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={filterAnchorEl}
                        open={Boolean(filterAnchorEl)}
                        onClose={handleFilterClose}
                    >
                        <MenuItem
                            onClick={() => handleFilterSelect('category', null)}
                            selected={categoryFilter === null}
                        >
                            <ListItemText>All Categories</ListItemText>
                        </MenuItem>
                        <Divider />
                        {uniqueCategories.map(category => (
                            <MenuItem
                                key={category}
                                onClick={() => handleFilterSelect('category', category)}
                                selected={categoryFilter === category}
                            >
                                <ListItemText>{category}</ListItemText>
                            </MenuItem>
                        ))}
                        <Divider />
                        <MenuItem
                            onClick={() => handleFilterSelect('subcategory', null)}
                            selected={subcategoryFilter === null}
                        >
                            <ListItemText>All Subcategories</ListItemText>
                        </MenuItem>
                        <Divider />
                        {uniqueSubcategories.map(subcategory => (
                            <MenuItem
                                key={subcategory}
                                onClick={() => handleFilterSelect('subcategory', subcategory)}
                                selected={subcategoryFilter === subcategory}
                            >
                                <ListItemText>{subcategory}</ListItemText>
                            </MenuItem>
                        ))}
                    </Menu>
                    <Tooltip title="Export as CSV">
                        <IconButton onClick={handleExportCSV}>
                            <FileDownloadIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Date Range
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                    {dateRangeOptions.map(option => (
                        <Button
                            key={option.label}
                            variant="outlined"
                            size="small"
                            onClick={() => handleDateRangeChange(option)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </Stack>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{
                        mt: 2,
                        '& .MuiFormControl-root': {
                            width: { xs: '100%', sm: '50%' }
                        }
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newDate: Date | null) => {
                                setStartDate(newDate);
                                // If end date is before start date, adjust it
                                if (endDate && newDate && endDate < newDate) {
                                    setEndDate(newDate);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                                {params.InputProps?.startAdornment}
                                            </>
                                        )
                                    }}
                                />
                            )}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newDate: Date | null) => {
                                setEndDate(newDate);
                                // If start date is after end date, adjust it
                                if (startDate && newDate && startDate > newDate) {
                                    setStartDate(newDate);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                                {params.InputProps?.startAdornment}
                                            </>
                                        )
                                    }}
                                />
                            )}
                        />
                    </LocalizationProvider>
                </Stack>

                {startDate && endDate && (
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                        Showing transactions from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
                    </Typography>
                )}
            </Box>

            {/* Active filters display */}
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {(categoryFilter || subcategoryFilter || (startDate && endDate)) && (
                    <>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            Active Filters:
                        </Typography>

                        {startDate && endDate && (
                            <Chip
                                label={`Date: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        )}

                        {categoryFilter && (
                            <Chip
                                label={`Category: ${categoryFilter}`}
                                size="small"
                                onDelete={() => setCategoryFilter(null)}
                            />
                        )}

                        {subcategoryFilter && (
                            <Chip
                                label={`Subcategory: ${subcategoryFilter}`}
                                size="small"
                                onDelete={() => setSubcategoryFilter(null)}
                            />
                        )}

                        {filteredTransactions.length > 0 && (
                            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                                ({filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found)
                            </Typography>
                        )}
                    </>
                )}
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ ml: 2 }}>
                        Loading transactions...
                    </Typography>
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ ml: 2 }}
                        onClick={() => {
                            setLoading(true);
                            setError(null);
                            refreshTransactions()
                                .catch(error => {
                                    setError('Failed to load transactions. Please try again.');
                                    console.error('Error refreshing transactions:', error);
                                })
                                .finally(() => {
                                    setLoading(false);
                                });
                        }}
                    >
                        Retry
                    </Button>
                </Alert>
            ) : filteredTransactions.length > 0 ? (
                <>
                    <TableContainer sx={{ mb: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Subcategory</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Tags</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTransactions.map((transaction: Transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{transaction.date}</TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    color: transaction.category === 'Income' ? 'success.main' : 'error.main',
                                                    fontWeight: 'medium'
                                                }}
                                            >
                                                ${transaction.amount.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={transaction.category}
                                                color={transaction.category === 'Income' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{transaction.subcategory}</TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell>
                                            {transaction.tags && transaction.tags.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {transaction.tags.map(tag => (
                                                        <Chip
                                                            key={tag}
                                                            label={tag}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => deleteTransaction(transaction.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>Summary</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography>
                                Total Income: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>${summary.totalIncome.toFixed(2)}</span>
                            </Typography>
                            <Typography>
                                Total Expense: <span style={{ color: '#f44336', fontWeight: 'bold' }}>${summary.totalExpense.toFixed(2)}</span>
                            </Typography>
                            <Typography>
                                Net Savings: <span style={{ color: summary.netSavings >= 0 ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                                    ${summary.netSavings.toFixed(2)}
                                </span>
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={handleToggleChart}
                        >
                            {showChart ? 'Hide Chart' : 'Show Chart'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleExportCSV}
                            startIcon={<FileDownloadIcon />}
                        >
                            Export to CSV
                        </Button>
                    </Box>

                    {showChart && filteredTransactions.length > 0 && (
                        <TransactionChart transactions={filteredTransactions} categoryBreakdown={summary.categoryBreakdown} />
                    )}
                </>
            ) : (
                <Box sx={{ textAlign: 'center', py: 5, px: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                        No Transactions Found
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px', mx: 'auto', color: 'text.secondary' }}>
                        There are no transactions in the selected date range. Add your first transaction to start tracking your finances.
                    </Typography>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1, sm: 2 }}
                        justifyContent="center"
                        sx={{ width: '100%' }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/add-transaction')}
                            sx={{
                                minWidth: { xs: '100%', sm: '200px' },
                                mb: { xs: 1, sm: 0 }
                            }}
                        >
                            Add Your First Transaction
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => {
                                // Add a quick test transaction for debugging
                                if (addTransaction) {
                                    const now = new Date();
                                    // Format for consistent display
                                    const formattedDescription = `Test transaction (${now.toLocaleString()})`;

                                    setLoading(true);

                                    // Generate a random amount between 10 and 1000
                                    const randomAmount = Math.floor(Math.random() * 990) + 10;

                                    // Alternate between income and expense randomly
                                    const category = Math.random() > 0.5 ? 'Income' : 'Expense';
                                    const subcategory = category === 'Income' ? 'Salary' : 'Shopping';

                                    // Create the transaction
                                    addTransaction(
                                        now,
                                        randomAmount,
                                        category,
                                        subcategory,
                                        formattedDescription,
                                        ['test', 'demo']
                                    )
                                        .then(() => {
                                            return refreshTransactions();
                                        })
                                        .then(() => {
                                            alert('Test transaction added successfully!');
                                            // Set the date range to include today to ensure the new transaction is visible
                                            const today = new Date();
                                            const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                                            const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                                            setStartDate(firstOfMonth);
                                            setEndDate(lastOfMonth);
                                        })
                                        .catch(error => {
                                            console.error('Error adding test transaction:', error);
                                            alert('Failed to add test transaction: ' + error.message);
                                        })
                                        .finally(() => {
                                            setLoading(false);
                                        });
                                }
                            }}
                        >
                            Add Test Transaction
                        </Button>
                    </Stack>
                </Box>
            )}
        </Paper>
    );
};

export default TransactionList; 