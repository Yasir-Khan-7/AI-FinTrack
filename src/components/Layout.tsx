import React, { useState, useMemo } from 'react';
import { Container, CssBaseline, Box, ThemeProvider, createTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    primary: {
                        main: '#3f51b5',
                    },
                    secondary: {
                        main: '#f50057',
                    },
                    background: {
                        default: darkMode ? '#121212' : '#f5f5f5',
                        paper: darkMode ? '#1e1e1e' : '#ffffff',
                    },
                },
                typography: {
                    fontFamily: [
                        'Inter',
                        '-apple-system',
                        'BlinkMacSystemFont',
                        '"Segoe UI"',
                        'Roboto',
                        '"Helvetica Neue"',
                        'Arial',
                        'sans-serif',
                    ].join(','),
                    h1: {
                        fontWeight: 600,
                    },
                    h2: {
                        fontWeight: 600,
                    },
                    h3: {
                        fontWeight: 600,
                    },
                    h4: {
                        fontWeight: 600,
                    },
                    h5: {
                        fontWeight: 600,
                    },
                    h6: {
                        fontWeight: 600,
                    },
                },
                components: {
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15)',
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                                },
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                                },
                            },
                            contained: {
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                },
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 8,
                                },
                            },
                        },
                    },
                    MuiListItem: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                            },
                        },
                    },
                    MuiChip: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            },
                        },
                    },
                    MuiAlert: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            },
                        },
                    },
                    MuiList: {
                        styleOverrides: {
                            root: {
                                padding: 8,
                            },
                        },
                    },
                    MuiListItemIcon: {
                        styleOverrides: {
                            root: {
                                minWidth: 40,
                            },
                        },
                    },
                },
                shape: {
                    borderRadius: 10,
                },
            }),
        [darkMode]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header toggleTheme={toggleDarkMode} isDarkMode={darkMode} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pt: 12,
                    pb: 6,
                    backgroundColor: theme.palette.background.default,
                    minHeight: '100vh'
                }}
            >
                <Container maxWidth="lg">
                    {children}
                    <Outlet />
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Layout; 