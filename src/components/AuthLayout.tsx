import React from 'react';
import { Box, useTheme, Container, Paper } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSwitchToLogin = () => navigate('/auth/login');
    const handleSwitchToSignUp = () => navigate('/auth/signup');
    const handleSwitchToForgotPassword = () => navigate('/auth/forgot-password');

    // Make Login the active component
    React.useEffect(() => {
        // If we're at /auth, redirect to /auth/login
        if (location.pathname === '/auth') {
            navigate('/auth/login');
        }
    }, [location, navigate]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: theme.palette.background.default,
                position: 'relative',
                overflow: 'hidden',
                pt: 4,
                pb: 10,
            }}
        >
            {/* Background design elements - subtle geometric shapes */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 80,
                    left: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    opacity: theme.palette.mode === 'dark' ? 0.07 : 0.05,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.secondary.main,
                    opacity: theme.palette.mode === 'dark' ? 0.07 : 0.05,
                }}
            />

            <Container maxWidth="sm" sx={{ zIndex: 1 }}>
                <Outlet context={{
                    onSwitchToLogin: handleSwitchToLogin,
                    onSwitchToSignUp: handleSwitchToSignUp,
                    onForgotPassword: handleSwitchToForgotPassword,
                    onBack: handleSwitchToLogin
                }} />
            </Container>

            {/* Footer with attribution */}
            <Paper
                elevation={0}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    width: '100%',
                    textAlign: 'center',
                    py: 2,
                    backgroundColor: 'transparent',
                    borderTop: `1px solid ${theme.palette.divider}`,
                    backdropFilter: 'blur(10px)',
                    zIndex: 10,
                }}
            >
                <Box component="span" sx={{ opacity: 0.6, fontSize: '0.875rem' }}>
                    © {new Date().getFullYear()} FinTrack • Secure Personal Finance Management
                </Box>
            </Paper>
        </Box>
    );
};

export default AuthLayout; 