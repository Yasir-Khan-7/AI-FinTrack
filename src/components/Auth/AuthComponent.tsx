import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Grid,
    Alert,
    Link,
    Divider,
    CircularProgress
} from '@mui/material';
import { supabase } from '../../lib/supabase';

type AuthMode = 'signin' | 'signup' | 'reset';

export const AuthComponent: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<AuthMode>('signin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        // Clear messages when mode changes
        setError(null);
        setMessage(null);
    }, [mode]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            setMessage('Sign in successful! Redirecting...');
            setRedirecting(true);

            // Auth state will be picked up by the auth listener in App component
        } catch (error: any) {
            setError(error.message || 'An error occurred during sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({ email, password });

            if (error) throw error;

            setMessage('Sign up successful! Please check your email to confirm your account.');
        } catch (error: any) {
            setError(error.message || 'An error occurred during sign up');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setMessage('Check your email for a password reset link');
        } catch (error: any) {
            setError(error.message || 'An error occurred during password reset');
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        switch (mode) {
            case 'signin':
                return (
                    <Box component="form" onSubmit={handleSignIn} sx={{ mt: 2 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading || redirecting}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link
                                    href="#"
                                    variant="body2"
                                    onClick={(e) => { e.preventDefault(); setMode('reset'); }}
                                >
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link
                                    href="#"
                                    variant="body2"
                                    onClick={(e) => { e.preventDefault(); setMode('signup'); }}
                                >
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 'signup':
                return (
                    <Box component="form" onSubmit={handleSignUp} sx={{ mt: 2 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            helperText="Password must be at least 6 characters"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link
                                    href="#"
                                    variant="body2"
                                    onClick={(e) => { e.preventDefault(); setMode('signin'); }}
                                >
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 'reset':
                return (
                    <Box component="form" onSubmit={handlePasswordReset} sx={{ mt: 2 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link
                                    href="#"
                                    variant="body2"
                                    onClick={(e) => { e.preventDefault(); setMode('signin'); }}
                                >
                                    Back to Sign In
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                );
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: '100%',
                        borderRadius: 2
                    }}
                >
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        {mode === 'signin' ? 'Welcome back to Finance Tracker' :
                            mode === 'signup' ? 'Create an account to start tracking your finances' :
                                'Enter your email to receive a password reset link'}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                    {renderForm()}
                </Paper>
            </Box>
        </Container>
    );
};

export default AuthComponent; 