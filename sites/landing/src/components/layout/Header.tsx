// src/components/layout/Header.tsx
import React, {useEffect, useState} from 'react';
import {
    Sheet,
    IconButton,
    Box,
    Typography,
    Button,
    Container,
    useColorScheme,
    Stack,
    Menu,
    MenuItem
} from '@mui/joy';
import {useScrollPosition} from '../../hooks/useScrollPosition';
import {LucideMenu} from "lucide-react";

// Header component with adaptive scroll behavior
const Header = () => {
    const {mode, setMode} = useColorScheme();
    const {isAtTop} = useScrollPosition();
    const [isExpanded, setIsExpanded] = useState(true);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    // Update header state based on scroll position
    useEffect(() => {
        setIsExpanded(isAtTop);
    }, [isAtTop]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const topNavItems = ['HOME', 'PRODUCT', 'SOLUTIONS', 'COMPETITIONS', 'ABOUT US'];

    return (
        <Sheet
            component="header"
            color="neutral"
            variant={isExpanded ? "soft" : "solid"}
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(8px)',
                backgroundColor: theme => isExpanded
                    ? `rgba(${theme.vars.palette.background.surface}, 0.8)`
                    : `rgba(${theme.vars.palette.background.surface}, 0.95)`,
                boxShadow: isExpanded ? 'none' : '0 2px 10px rgba(0,0,0,0.1)',
                height: isExpanded ? '76px' : '64px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
            }}
        >
            <Container maxWidth="lg" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%'
            }}>
                {/* Logo Section */}
                <Box>
                    <img
                        src="/mythica_logo_web.avif"
                        alt="Mythica Logo"
                        style={{
                            height: '30px',
                            objectFit: 'contain'
                        }}
                    />
                </Box>

                {/* Navigation Links - Desktop */}
                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                        display: {xs: 'none', md: 'flex'},
                        height: '100%',
                        alignItems: 'center'
                    }}
                >
                    {topNavItems.map((item) => (
                        <Button
                            key={item}
                            variant="plain"
                            color="neutral"
                            sx={{
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                transition: 'all 0.15s ease',
                                position: 'relative',
                                whiteSpace: 'nowrap',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '0%',
                                    height: '2px',
                                    backgroundColor: 'primary.500',
                                    transition: 'width 0.2s ease',
                                },
                                '&:hover': {
                                    bgcolor: 'transparent',
                                    '&::after': {
                                        width: '80%',
                                    },
                                },
                            }}
                        >
                            {item}
                        </Button>
                    ))}
                </Stack>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                    {/* Theme Toggle */}
                    <IconButton
                        variant="soft"
                        color="primary"
                        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                        sx={{
                            borderRadius: '50%',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                                transform: 'rotate(15deg)'
                            }
                        }}
                    >
                        {mode === 'dark' ? '🌙' : '☀️'}
                    </IconButton>

                    {/* Login/Sign Up - desktop only */}
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            display: {xs: 'none', sm: 'flex'}
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="primary"
                            size={isExpanded ? "md" : "sm"}
                            sx={{
                                transition: 'all 0.2s ease',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Log In
                        </Button>
                        <Button
                            variant="solid"
                            color="primary"
                            size={isExpanded ? "md" : "sm"}
                            sx={{
                                transition: 'all 0.2s ease',
                                fontWeight: 500,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Sign Up
                        </Button>
                    </Stack>

                    {/* Mobile Menu Button */}
                    <IconButton
                        variant="soft"
                        color="neutral"
                        sx={{display: {xs: 'flex', md: 'none'}}}
                        onClick={handleMenuOpen}
                        aria-label="Open menu"
                    >
                        <LucideMenu/>
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={handleMenuClose}
                        sx={{
                            display: {xs: 'block', md: 'none'},
                            '& .MuiMenuItem-root': {
                                transition: 'all 0.2s ease',
                            },
                        }}
                    >
                        {topNavItems.map((item) => (
                            <MenuItem
                                key={item}
                                onClick={handleMenuClose}
                            >
                                {item}
                            </MenuItem>
                        ))}
                    </Menu>
                </Stack>
            </Container>
        </Sheet>
    );
};

export default Header;