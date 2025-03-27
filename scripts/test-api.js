// Test script for financial-assistant API endpoint
const fetch = require('node-fetch');

async function testApi() {
    console.log('Testing financial-assistant API endpoint...');

    const testData = {
        transactionData: {
            totalIncome: 5000,
            totalExpense: 3500,
            netSavings: 1500,
            categories: {
                'Food & Dining': 800,
                'Housing': 1200,
                'Transportation': 400,
                'Entertainment': 300,
                'Shopping': 500,
                'Other': 300
            },
            recentTransactions: [
                {
                    id: '1',
                    date: '2023-04-15',
                    amount: 50,
                    category: 'Expense',
                    subcategory: 'Food & Dining',
                    description: 'Grocery shopping'
                },
                {
                    id: '2',
                    date: '2023-04-10',
                    amount: 1200,
                    category: 'Income',
                    subcategory: 'Salary',
                    description: 'Monthly salary'
                }
            ]
        }
    };

    try {
        // Use your local Next.js server URL
        const response = await fetch('http://localhost:3000/api/financial-assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        // Log the full response for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.raw());

        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Response data:', data);
        } else {
            const text = await response.text();
            console.log('Response text:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
            console.error('ERROR: Expected JSON response but received:', contentType);
        }
    } catch (error) {
        console.error('Error testing API:', error);
    }
}

testApi(); 