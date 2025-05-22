// src/components/layout/Header.tsx
import React, {useEffect, useState} from 'react';
import {
    Sheet,
    IconButton,
    Button,
    Container,
    useColorScheme,
    Stack,
    Menu,
    MenuItem, Dropdown, MenuButton
} from '@mui/joy';
import {useScrollPosition} from '../../hooks/useScrollPosition';
import {LucideMenu} from "lucide-react";
import {useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

interface LinkMenuItemProps {
  to: string;
  handleNavigate: (to: string) => void;
  children: React.ReactNode;
  isActive?: boolean;
}

const MENU_TIMEOUT = 100;

const LinkMenuItem: React.FC<LinkMenuItemProps> = (props) => {
  return (
    <MenuItem
      sx={{
        textDecoration: "none",
        color: "inherit",
        "&:hover": {
          textDecoration: "none",
        },
      }}
      onClick={() => props.handleNavigate(props.to)}
      selected={props.isActive}
    >
      {props.children}
    </MenuItem>
  );
};

// Header component with adaptive scroll behavior
const Header = () => {
    const {mode, setMode} = useColorScheme();
    const {isAtTop} = useScrollPosition();
    const [isExpanded, setIsExpanded] = useState(true);
    const [open, setOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleOpenChange = React.useCallback(
        (_: React.SyntheticEvent | null, isOpen: boolean) => {
      setOpen(isOpen);
        },
        [],
      );
    const handleNavigate = (to: string) => {
    setOpen(false);
    setTimeout(() => {
      navigate(to);
    }, MENU_TIMEOUT);
  };

    // Update header state based on scroll position
    useEffect(() => {
        setIsExpanded(isAtTop);
    }, [isAtTop]);


    const navMenuItems = [
        {
            token: 'navMenu.home',
            to: '/home',
        },
        {
            token: 'navMenu.products',
            to: '/products'
        },
        {
            token: 'navMenu.solutions',
            to: '/solutions'
        },
        {
            token: 'navMenu.competitions',
            to: '/competitions'
        },
        {
            token: 'navMenu.about',
            to: '/about'
        }
    ];

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
                 <img
                        src="/mythica_logo_web.avif"
                        alt="Mythica Logo"
                        style={{
                            height: '30px',
                            objectFit: 'contain'
                        }}
                    />

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
                    {navMenuItems.map((item, idx) => (
                        <Button
                            key={idx}
                            variant="plain"
                            color="neutral"
                            onClick={() => handleNavigate(item.to)}
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
                            {t(item.token)}
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

                    {/* Mobile Menu Button, handle open state with timeout to auto close menu*/}
                    <Dropdown open={open} onOpenChange={handleOpenChange}>
                        <MenuButton
                            variant="soft"
                            color="neutral"
                            sx={{cursor: "pointer", display: {xs: 'flex', md: 'none'}}}>
                            <LucideMenu/>
                        </MenuButton>
                        <Menu>
                            {navMenuItems.map((item, idx) => (
                                <LinkMenuItem
                                    handleNavigate={handleNavigate}
                                    to={item.to}
                                    isActive={location.pathname === item.to}
                                    key={idx}
                                  >
                                    {t(item.token)}
                                </LinkMenuItem>
                        ))}
                        </Menu>
                    </Dropdown>
                </Stack>
            </Container>
        </Sheet>
    );
};

export default Header;