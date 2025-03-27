import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Alert,
    SelectChangeEvent,
    Stack,
    Chip,
    Snackbar
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useTransactions } from '../context/TransactionContext';
import TagsInput from './TagsInput';
import { Category } from '../types';
import { useNavigate } from 'react-router-dom';

const AddTransaction: React.FC = () => {
    const [date, setDate] = useState<Date | null>(new Date());
    const [amount, setAmount] = useState<string>('');
    const [category, setCategory] = useState<Category>('Expense');
    const [subcategory, setSubcategory] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [successOpen, setSuccessOpen] = useState(false);
    const navigate = useNavigate();

    const { addTransaction, refreshTransactions } = useTransactions();

    // Update subcategories when category changes
    useEffect(() => {
        if (category === 'Income') {
            const incomeSubcategories: string[] = [
                'Salary', 'Freelance', 'Investments', 'Gifts', 'Refunds', 'Business', 'Other'
            ];
            setSubcategories(incomeSubcategories);
            setSubcategory(incomeSubcategories[0]);
        } else {
            const expenseSubcategories: string[] = [
                'Food & Dining', 'Shopping', 'Housing', 'Transportation',
                'Entertainment', 'Healthcare', 'Personal Care', 'Education',
                'Travel', 'Utilities', 'Insurance', 'Debt Payments',
                'Savings & Investments', 'Gifts & Donations', 'Other'
            ];
            setSubcategories(expenseSubcategories);
            setSubcategory(expenseSubcategories[0]);
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!date) {
            setError('Please select a date');
            return;
        }

        let amountValue = parseFloat(amount);
        if (isNaN(amountValue) || amountValue <= 0) {
            setError('Please enter a valid positive amount');
            return;
        }

        // Ensure expense amounts are negative for proper categorization
        if (category === 'Expense') {
            amountValue = -Math.abs(amountValue);
        }

        if (!subcategory) {
            setError('Please select a subcategory');
            return;
        }

        try {
            // Ensure date is a proper Date object
            const validDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

            console.log('Submitting transaction with values:', {
                date: validDate.toISOString(),
                amount: amountValue,
                category,
                subcategory,
                description,
                tags: tags.length > 0 ? tags : undefined
            });

            // Add the transaction with the potentially negated amount
            await addTransaction(validDate, amountValue, category, subcategory, description, tags.length > 0 ? tags : undefined);

            // Force refresh transactions to update the UI
            await refreshTransactions();

            // Show success message
            setSuccessOpen(true);

            // Reset form
            setAmount('');
            setDescription('');
            setDate(new Date());
            setCategory('Expense');
            setTags([]);

            // Log for debugging
            console.log('Transaction added and UI refreshed successfully');

            // Wait for the success message to be visible briefly before navigating
            setTimeout(() => {
                navigate('/transactions');
            }, 1500);
        } catch (err: any) {
            console.error('Error adding transaction:', err);
            setError(`Failed to add transaction: ${err.message || 'Unknown error'}`);
        }
    };

    const handleCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSuccessOpen(false);
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" component="h2" gutterBottom>
                Add New Transaction
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Transaction Date"
                        value={date}
                        onChange={(newDate: Date | null) => setDate(newDate)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                margin="normal"
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                </LocalizationProvider>

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="amount"
                    label="Amount"
                    name="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                        labelId="category-label"
                        id="category"
                        value={category}
                        label="Category"
                        onChange={(e: SelectChangeEvent) => setCategory(e.target.value as Category)}
                    >
                        <MenuItem value="Income">Income</MenuItem>
                        <MenuItem value="Expense">Expense</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="subcategory-label">Subcategory</InputLabel>
                    <Select
                        labelId="subcategory-label"
                        id="subcategory"
                        value={subcategory}
                        label="Subcategory"
                        onChange={(e: SelectChangeEvent) => setSubcategory(e.target.value)}
                    >
                        {subcategories.map((sub) => (
                            <MenuItem key={sub} value={sub}>
                                {sub}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    margin="normal"
                    fullWidth
                    id="description"
                    label="Description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Tags (optional)
                    </Typography>
                    <TagsInput
                        tags={tags}
                        onChange={setTags}
                    />
                </Box>

                {error && (
                    <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                >
                    Add Transaction
                </Button>
            </Box>

            <Snackbar
                open={successOpen}
                autoHideDuration={4000}
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSuccess}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Transaction added successfully!
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default AddTransaction; 