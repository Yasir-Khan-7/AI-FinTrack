import React from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { TransactionProvider } from '../context/TransactionContext';
import theme from '../theme';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <TransactionProvider>
                <Component {...pageProps} />
            </TransactionProvider>
        </ThemeProvider>
    );
}

export default MyApp; 