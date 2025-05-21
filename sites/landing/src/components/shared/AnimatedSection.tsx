// src/components/shared/AnimatedSection.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { Box, Container, Typography, useTheme } from '@mui/joy';
import { useIntersectionObserver } from '../../hooks/useScrollPosition';

interface AnimatedSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  bgColor?: string;
  textColor?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  py?: number | object;
  px?: number | object;
  animate?: boolean;
  animationDirection?: 'up' | 'down' | 'left' | 'right';
  animationDelay?: number;
  id?: string;
  sx?: object;
}

// Animated section component that triggers animations when scrolled into view
const AnimatedSection: React.FC<AnimatedSectionProps> = ({ 
  children, 
  title, 
  subtitle,
  align = 'center',
  bgColor,
  textColor,
  maxWidth = 'lg',
  py = { xs: 6, md: 10 },
  px,
  animate = true,
  animationDirection = 'up',
  animationDelay = 0,
  id,
  sx = {}
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px',
  });
  
  const theme = useTheme();
  
  // Direction-based animations
  const getAnimationStyles = () => {
    if (!animate || !hasAnimated) return {};
    
    const baseStyle = {
      opacity: 1,
      transform: 'translate(0, 0)',
    };
    
    return baseStyle;
  };
  
  // Initial animation states based on direction
  const getInitialStyles = () => {
    if (!animate) return {};
    
    let transform = 'translate(0, 60px)';
    if (animationDirection === 'down') transform = 'translate(0, -60px)';
    if (animationDirection === 'left') transform = 'translate(60px, 0)';
    if (animationDirection === 'right') transform = 'translate(-60px, 0)';
    
    return {
      opacity: 0,
      transform,
    };
  };
  
  // Trigger animation when section comes into view
  useEffect(() => {
    if (isIntersecting && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isIntersecting, hasAnimated]);
  
  return (
    <Box
      component="section"
      ref={elementRef}
      id={id}
      sx={{
        position: 'relative',
        py,
        px,
        bgcolor: bgColor || 'background.surface',
        color: textColor || 'text.primary',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Container
        maxWidth={maxWidth}
        sx={{
          textAlign: align,
          transition: animate ? `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${animationDelay}s` : 'none',
          ...getInitialStyles(),
          ...(hasAnimated ? getAnimationStyles() : {}),
        }}
      >
        {/* Section header */}
        {(title || subtitle) && (
          <Box sx={{ mb: { xs: 4, md: 6 } }}>
            {title && (
              <Typography
                component="h2"
                level="h2"
                sx={{
                  fontWeight: 'bold',
                  mb: subtitle ? 2 : 0,
                  fontFamily: 'var(--joy-fontFamily-display)',
                  position: 'relative',
                  display: 'inline-block',
                  '&::after': title ? {
                    content: '""',
                    position: 'absolute',
                    bottom: '-12px',
                    left: align === 'center' ? '50%' : align === 'right' ? 'auto' : '0',
                    right: align === 'right' ? '0' : 'auto',
                    transform: align === 'center' ? 'translateX(-50%)' : 'none',
                    width: '60px',
                    height: '4px',
                    bgcolor: 'primary.500',
                    borderRadius: '2px',
                  } : {},
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                level="body1"
                sx={{
                  maxWidth: align === 'center' ? '650px' : 'none',
                  mx: align === 'center' ? 'auto' : 0,
                  opacity: 0.8,
                  fontSize: { xs: 'md', md: 'lg' },
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        
        {/* Section content */}
        {children}
        
        {/* Optional background decorations for futuristic look */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: '20%',
            height: '40%',
            background: 'radial-gradient(circle, rgba(58, 134, 255, 0.03) 0%, rgba(58, 134, 255, 0) 70%)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            width: '25%',
            height: '30%',
            background: 'radial-gradient(circle, rgba(131, 56, 236, 0.03) 0%, rgba(131, 56, 236, 0) 70%)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '0',
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(58, 134, 255, 0.1) 50%, transparent 100%)',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: 0.5,
          }}
        />
      </Container>
    </Box>
  );
};

export default AnimatedSection;