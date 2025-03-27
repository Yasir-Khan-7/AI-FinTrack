import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Link,
    InputAdornment,
    Alert,
    CircularProgress,
    useTheme,
    Container
} from '@mui/material';
import { Email } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';

interface AuthContextType {
    onSwitchToLogin: () => void;
    onSwitchToSignUp: () => void;
    onForgotPassword: () => void;
    onBack: () => void;
}

const ForgotPassword: React.FC = () => {
    const theme = useTheme();
    const { onBack } = useOutletContext<AuthContextType>();
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { success, error } = await resetPassword(email);

            if (success) {
                setSuccess(true);
            } else if (error) {
                setError(error);
            }
        } catch (error: any) {
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    mt: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Reset Password
                    </Typography>

                    {success ? (
                        <Box>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Password reset email sent! Check your inbox for further instructions.
                            </Alert>
                            <Button
                                onClick={onBack}
                                fullWidth
                                variant="contained"
                            >
                                Back to Login
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
                                Enter your email address and we'll send you a link to reset your password
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit} noValidate>
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
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    {loading ? 'Sending...' : 'Reset Password'}
                                </Button>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Link
                                        component="button"
                                        type="button"
                                        variant="body2"
                                        onClick={onBack}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        Back to Login
                                    </Link>
                                </Box>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default ForgotPassword; 