import React, { useState } from 'react';
import { Tabs, Tab, Box, Paper, Button, AppBar, Toolbar, Typography, IconButton, useMediaQuery, useTheme, Menu, MenuItem } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // For mobile profile menu
    const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMobileMenuAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuAnchorEl(null);
    };

    // Get the current path and set the appropriate tab value
    const getTabValue = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 0;
        if (path.includes('/transactions')) return 1;
        if (path.includes('/add-transaction')) return 2;
        if (path.includes('/ai-assistant')) return 3;
        return 0; // Default to dashboard
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        // Navigate based on tab value
        switch (newValue) {
            case 0:
                navigate('/dashboard');
                break;
            case 1:
                navigate('/transactions');
                break;
            case 2:
                navigate('/add-transaction');
                break;
            case 3:
                navigate('/ai-assistant');
                break;
            default:
                navigate('/dashboard');
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            // Redirect handled by auth state change in AuthProvider
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <AppBar position="static" color="default" elevation={2} sx={{ mb: 3 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Finance Tracker
                    </Typography>

                    {isMobile ? (
                        <>
                            <IconButton
                                size="large"
                                edge="end"
                                onClick={handleMobileMenuOpen}
                                color="inherit"
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={mobileMenuAnchorEl}
                                open={isMobileMenuOpen}
                                onClose={handleMobileMenuClose}
                            >
                                <MenuItem onClick={handleSignOut}>
                                    <IconButton size="small" color="inherit">
                                        <LogoutIcon fontSize="small" />
                                    </IconButton>
                                    <Typography variant="body2">Sign Out</Typography>
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {user && (
                                <>
                                    <Typography variant="body2" sx={{ mr: 2 }}>
                                        {user.email}
                                    </Typography>
                                    <IconButton
                                        color="inherit"
                                        onClick={handleSignOut}
                                        sx={{ ml: 1 }}
                                    >
                                        <LogoutIcon />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    )}
                </Toolbar>
                <Tabs
                    value={getTabValue()}
                    onChange={handleChange}
                    variant={isMobile ? "scrollable" : "fullWidth"}
                    scrollButtons={isMobile ? "auto" : undefined}
                    allowScrollButtonsMobile={isMobile}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            minWidth: isMobile ? 'auto' : undefined,
                            fontSize: isMobile ? '0.75rem' : undefined,
                            px: isMobile ? 1 : 2,
                        }
                    }}
                >
                    <Tab
                        icon={<DashboardIcon />}
                        label="Dashboard"
                        iconPosition="start"
                        sx={{ py: 2 }}
                    />
                    <Tab
                        icon={<ListAltIcon />}
                        label="Transactions"
                        iconPosition="start"
                        sx={{ py: 2 }}
                    />
                    <Tab
                        icon={<AddIcon />}
                        label="Add Transaction"
                        iconPosition="start"
                        sx={{ py: 2 }}
                    />
                    <Tab
                        icon={<SmartToyIcon />}
                        label="AI Assistant"
                        iconPosition="start"
                        sx={{ py: 2 }}
                    />
                </Tabs>
            </AppBar>
        </Box>
    );
};

export default Navigation; 