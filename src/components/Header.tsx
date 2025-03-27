import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Tooltip,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    toggleTheme?: () => void;
    isDarkMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, isDarkMode = false }) => {
    const { user, signOut } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        await signOut();
    };

    // Get user initials for the avatar
    const getUserInitials = (): string => {
        if (!user || !user.email) return '?';
        return user.email.charAt(0).toUpperCase();
    };

    return (
        <AppBar position="fixed" color="primary" elevation={3} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MonetizationOnIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize: 30 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        FINTRACK
                    </Typography>
                </Box>

                <MonetizationOnIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, fontSize: 26 }} />
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        flexGrow: 1,
                        display: { xs: 'flex', md: 'none' },
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.2rem',
                    }}
                >
                    FINTRACK
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Theme toggle button */}
                    {toggleTheme && (
                        <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                            <IconButton
                                color="inherit"
                                onClick={toggleTheme}
                                sx={{ ml: 1 }}
                                aria-label="toggle theme"
                            >
                                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* User profile button */}
                    {user && (
                        <>
                            <Tooltip title="Account settings">
                                <IconButton
                                    onClick={handleClick}
                                    size="small"
                                    sx={{ ml: 1 }}
                                    aria-controls={open ? 'account-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                >
                                    <Avatar
                                        sx={{
                                            width: 35,
                                            height: 35,
                                            bgcolor: 'secondary.main',
                                            fontSize: '1rem',
                                        }}
                                    >
                                        {getUserInitials()}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>

                            <Menu
                                id="account-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                PaperProps={{
                                    elevation: 4,
                                    sx: {
                                        width: 220,
                                        borderRadius: 2,
                                        overflow: 'visible',
                                        mt: 1.5,
                                        '&:before': {
                                            content: '""',
                                            display: 'block',
                                            position: 'absolute',
                                            top: 0,
                                            right: 14,
                                            width: 10,
                                            height: 10,
                                            bgcolor: 'background.paper',
                                            transform: 'translateY(-50%) rotate(45deg)',
                                            zIndex: 0,
                                        },
                                    },
                                }}
                            >
                                <Box sx={{ px: 2, py: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {user.email}
                                    </Typography>
                                </Box>
                                <Divider />
                                <MenuItem onClick={handleClose}>
                                    <ListItemIcon>
                                        <AccountCircleIcon fontSize="small" />
                                    </ListItemIcon>
                                    My Profile
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" />
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 