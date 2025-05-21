// src/components/layout/Header.tsx
import React, { useEffect, useState } from 'react';
import { 
  Sheet, 
  IconButton, 
  Box, 
  Typography,
  Button,
  Container,
  useColorScheme,
  Stack
} from '@mui/joy';
import { useScrollPosition } from '../../hooks/useScrollPosition';

// Header component with adaptive scroll behavior
const Header = () => {
  const { mode, setMode } = useColorScheme();
  const { y: scrollY, isAtTop } = useScrollPosition();
  const [isExpanded, setIsExpanded] = useState(true);

  // Update header state based on scroll position
  useEffect(() => {
    // Collapse header when scrolling down past threshold
    setIsExpanded(isAtTop);
  }, [isAtTop]);

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
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(10px)',
        backgroundColor: theme => isExpanded 
          ? `rgba(${theme.vars.palette.background.surface}, 0.7)` 
          : `rgba(${theme.vars.palette.background.surface}, 0.95)`,
        boxShadow: isExpanded ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
        height: isExpanded ? '80px' : '60px',
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
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          transform: isExpanded ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.3s ease',
        }}>
          <Typography 
            level="h4" 
            component="span" 
            sx={{ 
              fontFamily: 'var(--joy-fontFamily-display)',
              background: 'linear-gradient(90deg, var(--joy-palette-primary-500) 0%, var(--joy-palette-primary-600) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              letterSpacing: '-0.5px',
            }}
          >
            LANDING SPA
          </Typography>
        </Box>
        
        {/* Navigation Links - Desktop */}
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            height: '100%',
            alignItems: 'center'
          }}
        >
          {['Home', 'Features', 'Services', 'About', 'Contact'].map((item) => (
            <Button
              key={item}
              variant="plain"
              color="neutral"
              sx={{
                fontWeight: 500,
                transition: 'all 0.2s ease',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '0%',
                  height: '2px',
                  backgroundColor: 'primary.500',
                  transition: 'width 0.3s ease',
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
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {/* Theme Toggle */}
          <IconButton 
            variant="soft" 
            color="primary"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            sx={{ 
              borderRadius: '50%',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'rotate(20deg)'
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
              display: { xs: 'none', sm: 'flex' } 
            }}
          >
            <Button 
              variant="outlined" 
              color="primary"
              size={isExpanded ? "md" : "sm"}
              sx={{ 
                transition: 'all 0.3s ease',
                fontWeight: 500,
              }}
            >
              Log In
            </Button>
            <Button 
              variant="solid" 
              color="primary"
              size={isExpanded ? "md" : "sm"}
              sx={{ 
                transition: 'all 0.3s ease',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
              }}
            >
              Sign Up
            </Button>
          </Stack>
          
          {/* Mobile Menu Button */}
          <IconButton
            variant="soft"
            color="neutral"
            sx={{ display: { xs: 'flex', md: 'none' } }}
            aria-label="Open menu"
          >
            ≡
          </IconButton>
        </Stack>
      </Container>
    </Sheet>
  );
};

export default Header;