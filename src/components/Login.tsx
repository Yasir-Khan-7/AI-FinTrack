import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Link,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    useTheme,
    Snackbar
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';

interface AuthContextType {
    onSwitchToLogin: () => void;
    onSwitchToSignUp: () => void;
    onForgotPassword: () => void;
    onBack: () => void;
}

const Login: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { onSwitchToSignUp, onForgotPassword } = useOutletContext<AuthContextType>();
    const { signIn, resendVerificationEmail, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEmailVerificationError, setIsEmailVerificationError] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(3);

    // Effect to handle redirect after successful login
    useEffect(() => {
        if (loginSuccess) {
            const timer = setTimeout(() => {
                if (redirectCountdown <= 1) {
                    navigate('/dashboard');
                } else {
                    setRedirectCountdown(prev => prev - 1);
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [loginSuccess, redirectCountdown, navigate]);

    // Check if user is already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsEmailVerificationError(false);
        setLoading(true);

        try {
            const { success, error } = await signIn(email, password);
            if (success) {
                setLoginSuccess(true);
                setSnackbarMessage('Sign in successful! Redirecting...');
                setSnackbarOpen(true);
            } else if (error) {
                if (error.toLowerCase().includes('email') &&
                    (error.toLowerCase().includes('verify') ||
                        error.toLowerCase().includes('confirmation') ||
                        error.toLowerCase().includes('confirmed'))) {
                    setIsEmailVerificationError(true);
                }
                setError(error);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            setError('Please enter your email address first');
            return;
        }

        setResendLoading(true);

        try {
            const { success, error } = await resendVerificationEmail(email);

            if (success) {
                setSnackbarMessage('Verification email sent! Please check your inbox.');
                setSnackbarOpen(true);
            } else if (error) {
                setError(`Failed to resend: ${error}`);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                maxWidth: 450,
                mx: 'auto',
                borderRadius: 3,
                background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.mode === 'dark'
                    ? 'rgba(66, 66, 66, 0.8)'
                    : 'rgba(250, 250, 250, 0.8)'
                    } 100%)`,
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                    : '0 8px 32px rgba(31, 38, 135, 0.1)'
            }}
        >
            <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                Log in to FinTrack
            </Typography>

            {loginSuccess ? (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                >
                    Sign in successful! Redirecting in {redirectCountdown}...
                </Alert>
            ) : isEmailVerificationError ? (
                <Alert
                    severity="warning"
                    sx={{ mb: 3 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleResendVerification}
                            disabled={resendLoading}
                        >
                            {resendLoading ? 'Sending...' : 'Resend'}
                        </Button>
                    }
                >
                    Your email has not been verified. Please check your inbox for the verification link or click "Resend" to get a new link.
                </Alert>
            ) : error && (
                <Alert severity="error" sx={{ mb: 3 }}>
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
                    sx={{ mb: 3 }}
                    disabled={loginSuccess}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleTogglePasswordVisibility}
                                    edge="end"
                                    disabled={loginSuccess}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 3 }}
                    disabled={loginSuccess}
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={loading || loginSuccess}
                    sx={{
                        py: 1.5,
                        mt: 2,
                        mb: 3,
                        borderRadius: 2,
                        position: 'relative'
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                </Button>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1
                    }}
                >
                    <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={onForgotPassword}
                        sx={{ cursor: 'pointer' }}
                        disabled={loginSuccess}
                    >
                        Forgot password?
                    </Link>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                            Don't have an account?
                        </Typography>
                        <Link
                            component="button"
                            type="button"
                            variant="body2"
                            onClick={onSwitchToSignUp}
                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                            disabled={loginSuccess}
                        >
                            Sign Up
                        </Link>
                    </Box>
                </Box>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
            />
        </Paper>
    );
};

export default Login; 