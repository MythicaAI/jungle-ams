// src/components/sections/SocialLinks.tsx
import React from 'react';
import { Box, Grid, Sheet, Typography, Button, Link, Stack } from '@mui/joy';
import AnimatedSection from '../shared/AnimatedSection';

interface SocialCardProps {
  title: string;
  icon: string;
  description: string;
  linkText: string;
  link: string;
  color: string;
  delay?: number;
}

// Social link card component
const SocialCard: React.FC<SocialCardProps> = ({
  title,
  icon,
  description,
  linkText,
  link,
  color,
  delay = 0,
}) => {
  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: 'lg',
        p: 4,
        height: '100%',
        transition: 'all 0.3s ease',
        opacity: 0,
        transform: 'translateY(20px)',
        animation: 'fadeIn 0.6s forwards',
        animationDelay: `${0.2 + delay}s`,
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 'md',
          bgcolor: `${color}10`,
        },
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Stack spacing={2} sx={{ height: '100%' }}>
        <Box
          sx={{
            fontSize: '2.5rem',
            color,
            mb: 1,
          }}
        >
          {icon}
        </Box>
        
        <Typography level="h4" fontWeight="bold">
          {title}
        </Typography>
        
        <Typography level="body2" sx={{ color: 'text.secondary', flexGrow: 1 }}>
          {description}
        </Typography>