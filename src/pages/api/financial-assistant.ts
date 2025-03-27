import { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';
import { Transaction } from '../../types';

// Initialize Groq with API key
const groq = new Groq({
    apiKey: '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'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { transactionData } = req.body;

        if (!transactionData) {
            res.status(400).json({ error: 'Transaction data is required' });
            return;
        }

        console.log('Processing transaction data for AI analysis');

        // Format the prompt for Groq
        const prompt = `
      As a financial advisor, provide 5 personalized financial suggestions based on the following transaction data:
      
      Total Income: $${transactionData.totalIncome.toFixed(2)}
      Total Expenses: $${transactionData.totalExpense.toFixed(2)}
      Net Savings: $${transactionData.netSavings.toFixed(2)}
      
      Spending by Category:
      ${Object.entries(transactionData.categories || {})
                .map(([category, amount]) => `${category}: $${(amount as number).toFixed(2)}`)
                .join('\n')}
      
      Recent Transactions:
      ${transactionData.recentTransactions && transactionData.recentTransactions.length > 0
                ? transactionData.recentTransactions
                    .map((t: Transaction) => `${t.date}: ${t.category} - ${t.subcategory} - $${t.amount.toFixed(2)} - ${t.description}`)
                    .join('\n')
                : 'No recent transactions available.'
            }
      
      Provide specific, actionable advice for budget optimization, saving opportunities, and spending habits improvement.
      Format each suggestion as a concise, helpful tip. Make suggestions data-driven based on the actual spending patterns.
      Do not include generic advice that doesn't relate to the specific transaction data provided.
    `;

        try {
            console.log('Calling Groq API...');
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'qwen-2.5-32b',
                temperature: 0.6,
                max_tokens: 2048,
                top_p: 0.95
            });

            // Extract suggestions from the response
            const content = chatCompletion.choices[0]?.message?.content || '';

            if (!content) {
                console.error('Empty response from Groq API');
                res.status(500).json({ error: 'Failed to generate suggestions - empty response' });
                return;
            }

            console.log('Successfully received AI response');

            // Parse the content to get individual suggestions
            const suggestions = content
                .split(/\d+\.\s+/)
                .filter(Boolean)
                .map(s => s.trim());

            if (suggestions.length === 0) {
                // If no suggestions were parsed, return the entire content as one suggestion
                res.status(200).json({
                    suggestions: [content.trim()]
                });
                return;
            }

            res.status(200).json({ suggestions });
            return;
        } catch (apiError: any) {
            console.error('Error calling Groq API:', apiError);
            res.status(500).json({
                error: 'Failed to generate suggestions - API error',
                details: apiError instanceof Error ? apiError.message : 'Unknown API error'
            });
            return;
        }
    } catch (error: any) {
        console.error('Error processing financial suggestions request:', error);
        res.status(500).json({
            error: 'Failed to process request',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
    }
} 