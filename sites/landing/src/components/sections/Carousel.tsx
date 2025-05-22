// src/components/sections/Carousel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Sheet, Typography, Container, IconButton, Stack } from '@mui/joy';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useIntersectionObserver } from '../../hooks/useScrollPosition';
import { ImagePlaceholder } from '../shared/ImagePlaceholder';

// Carousel component that transforms when scrolling
const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const { y: scrollY, progress } = useScrollPosition();
  const containerRef = useRef(null);
  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold: 0,
    rootMargin: '-80px 0px 0px 0px', // Offset for the header
  });

  // Sample carousel items
  const items = [
    { id: 1, title: 'Asset Tools', color: 'primary.400' },
    { id: 2, title: 'Game Pipelines', color: 'primary.500' },
    { id: 3, title: 'CreativeOps', color: 'primary.600' },
  ];

  // Handle carousel scroll transition
  useEffect(() => {
    if (containerRef.current) {
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const headerHeight = 80; // Match your header height
      setIsSticky(containerTop <= headerHeight && !isIntersecting);
    }
  }, [scrollY, isIntersecting]);

  // Animation values based on scroll
  const stickyProgress = isSticky ? Math.min((scrollY - 600) / 300, 1) : 0; // Adjust these values based on your page structure
  const carouselHeight = isSticky ? `${60 - stickyProgress * 20}px` : '240px';
  const itemWidth = isSticky ? `${100 / items.length}%` : '280px';
  const itemHeight = isSticky ? '100%' : '180px';
  const itemMargin = isSticky ? '0px' : '0 12px';
  const borderRadius = isSticky ? 'none' : 'md';

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        position: 'relative',
        zIndex: 10,
        padding: isSticky ? 0 : '40px 0',
        marginTop: isSticky ? '-80px' : 0, // Compensate for header height
        transition: 'padding 0.3s, margin 0.3s',
      }}
    >
      {/* Intersection observer reference element */}
      <Box 
        ref={elementRef} 
        sx={{ position: 'absolute', top: 0, height: '1px', width: '100%' }} 
      />

      <Sheet 
        variant={isSticky ? 'solid' : 'outlined'}
        color={isSticky ? 'primary' : 'neutral'}
        sx={{
          position: isSticky ? 'fixed' : 'relative',
          top: isSticky ? '60px' : 'auto', // Match with collapsed header height
          left: 0,
          right: 0,
          height: carouselHeight,
          transition: 'all 0.3s ease',
          borderRadius: borderRadius,
          boxShadow: isSticky ? 'md' : 'sm',
          backdropFilter: isSticky ? 'blur(8px)' : 'none',
          bgcolor: theme => isSticky 
            ? `rgba(${theme.vars.palette.primary[500]}, ${0.95 - stickyProgress * 0.3})` 
            : theme.vars.palette.background.surface,
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container 
          maxWidth="lg"
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSticky ? 'space-between' : 'center',
            overflow: 'hidden',
          }}
        >
          {/* Navigation indicators - only visible when not sticky */}
          {!isSticky && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: '12px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
            }}>
              {items.map((item, index) => (
                <Box
                  key={`indicator-${item.id}`}
                  sx={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: index === activeIndex ? 'primary.500' : 'neutral.300',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </Box>
          )}
          
          {/* Carousel Items */}
          <Stack
            direction="row"
            spacing={isSticky ? 0 : 2}
            sx={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: isSticky ? 'space-around' : 'center',
              transition: 'all 0.3s ease',
              transform: isSticky 
                ? 'none' 
                : `translateX(calc(-${activeIndex * 100}% - ${activeIndex * 24}px))`,
            }}
          >
            {items.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  width: itemWidth,
                  height: itemHeight,
                  margin: itemMargin,
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  opacity: isSticky ? 1 : index === activeIndex ? 1 : 0.7,
                  transform: isSticky ? 'none' : index === activeIndex ? 'scale(1.05)' : 'scale(1)',
                  '&:hover': {
                    opacity: 1,
                    transform: isSticky ? 'none' : 'scale(1.05)',
                  }
                }}
                onClick={() => setActiveIndex(index)}
              >
                {/* Carousel item content */}
                {isSticky ? (
                  // Sticky mode - simple text
                  <Typography
                    level={isSticky ? "body1" : "h3"}
                    fontWeight="bold"
                    sx={{
                      color: 'white',
                      textAlign: 'center',
                      fontSize: isSticky ? (1 - stickyProgress) * 0.25 + 0.75 + 'rem' : 'inherit',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {item.title}
                  </Typography>
                ) : (
                  // Carousel mode - image placeholder with text
                  <Box sx={{ height: '100%', position: 'relative' }}>
                    <ImagePlaceholder
                      height="100%"
                      text={`Thumb ${index + 1}`}
                      bg={item.color}
                      color="white"
                      borderRadius="md"
                      sx={{
                        boxShadow: index === activeIndex ? 'lg' : 'sm',
                      }}
                    />
                    <Typography
                      level="body1"
                      fontWeight="bold"
                      sx={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        color: 'white',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
          
          {/* Carousel navigation - only visible when not sticky */}
          {!isSticky && (
            <>
              <IconButton
                variant="soft"
                color="primary"
                size="md"
                sx={{
                  position: 'absolute',
                  left: { xs: '8px', md: '24px' },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '50%',
                  boxShadow: 'md',
                  zIndex: 2,
                  opacity: activeIndex > 0 ? 1 : 0.5,
                }}
                disabled={activeIndex <= 0}
                onClick={() => setActiveIndex(Math.max(activeIndex - 1, 0))}
              >
                ←
              </IconButton>
              <IconButton
                variant="soft"
                color="primary"
                size="md"
                sx={{
                  position: 'absolute',
                  right: { xs: '8px', md: '24px' },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '50%',
                  boxShadow: 'md',
                  zIndex: 2,
                  opacity: activeIndex < items.length - 1 ? 1 : 0.5,
                }}
                disabled={activeIndex >= items.length - 1}
                onClick={() => setActiveIndex(Math.min(activeIndex + 1, items.length - 1))}
              >
                →
              </IconButton>
            </>
          )}
        </Container>
      </Sheet>
    </Box>
  );
};

export default Carousel;