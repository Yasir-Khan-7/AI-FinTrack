import React, { useState } from 'react';
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
    Stepper,
    Step,
    StepLabel,
    useTheme
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';

interface AuthContextType {
    onSwitchToLogin: () => void;
    onSwitchToSignUp: () => void;
    onForgotPassword: () => void;
    onBack: () => void;
}

const SignUp: React.FC = () => {
    const theme = useTheme();
    const { onSwitchToLogin } = useOutletContext<AuthContextType>();
    const { signUp } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const validateStep = (step: number): boolean => {
        setError(null);

        if (step === 0) {
            if (!firstName.trim() || !lastName.trim()) {
                setError('Please provide both first and last name');
                return false;
            }
        } else if (step === 1) {
            if (!email.trim()) {
                setError('Please provide your email');
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Please provide a valid email address');
                return false;
            }
        } else if (step === 2) {
            if (!password.trim()) {
                setError('Please provide a password');
                return false;
            }
            if (password.length < 8) {
                setError('Password must be at least 8 characters long');
                return false;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateStep(2)) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { success, error } = await signUp(email, password);

            if (success) {
                setSuccess(true);
            } else if (error) {
                setError(error);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Personal Information', 'Email', 'Password'];

    if (success) {
        return (
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 450,
                    mx: 'auto',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)'
                }}
            >
                <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CheckCircle
                        color="success"
                        sx={{
                            fontSize: 60,
                            mb: 2,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': {
                                    opacity: 0.7,
                                    transform: 'scale(0.95)'
                                },
                                '70%': {
                                    opacity: 1,
                                    transform: 'scale(1.1)'
                                },
                                '100%': {
                                    opacity: 0.7,
                                    transform: 'scale(0.95)'
                                },
                            },
                        }}
                    />
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        Account Created Successfully!
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 1 }}>
                        A verification link has been sent to:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 3 }}>
                        {email}
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                        <Typography variant="body2">
                            <strong>Important:</strong> You must verify your email address before logging in.
                            Please check your inbox and spam folder for the verification email.
                        </Typography>
                    </Alert>

                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => window.open('https://mail.google.com', '_blank')}
                            sx={{ textTransform: 'none' }}
                        >
                            Open Gmail
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onSwitchToLogin}
                        >
                            Go to Login
                        </Button>
                    </Box>
                </Box>
            </Paper>
        );
    }

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
                Create your FinTrack Account
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
                {activeStep === 0 && (
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="firstName"
                            label="First Name"
                            name="firstName"
                            autoComplete="given-name"
                            autoFocus
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="lastName"
                            label="Last Name"
                            name="lastName"
                            autoComplete="family-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box sx={{ mb: 2 }}>
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
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="new-password"
                            autoFocus
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
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        variant="outlined"
                        sx={{ px: 3 }}
                    >
                        Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                            sx={{ px: 3, position: 'relative' }}
                        >
                            {loading ? (
                                <CircularProgress size={24} sx={{ position: 'absolute' }} />
                            ) : 'Sign Up'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ px: 3 }}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                    Already have an account?
                </Typography>
                <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={onSwitchToLogin}
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Log In
                </Link>
            </Box>
        </Paper>
    );
};

export default SignUp; 