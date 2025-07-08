// src/components/sections/ValueProposition.tsx
import React from 'react';
import {Box, Typography, Grid, Stack, Sheet } from '@mui/joy';
import AnimatedSection from '../shared/AnimatedSection';
import { testimonials, type Testimonial } from '../../data/testimonials';

interface TestimonialItemProps {
    item: Testimonial;
    delay?: number;
}

// Animated statistic item
const TestimonialItem: React.FC<TestimonialItemProps> = ({item, delay = 0}) => {
    return (
      <Stack
        direction={{xs: 'column', md: 'row'}}
        alignItems="center"
        spacing={3}
        sx={{
          textAlign: {xs: 'center', md: 'left'},
          willChange: 'transform, opacity',
          opacity: 0,
          transform: 'translateY(20px)',
          animation: 'fadeIn 0.6s forwards ease-out',
          animationDelay: `${0.2 + delay}s`,
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
        <Stack spacing={1} sx={{flex: 1}}>
          <Typography
            level="h4"
            fontWeight="bold"
            sx={{
              fontStyle: 'italic',
              color: 'text.primary',
              fontSize: {xs: '1.5rem', md: '2rem'},
            }}
          >
            “{item.text}”
          </Typography>
          <Typography
            level="body-md"
            fontWeight="medium"
            sx={{
              color: 'text.secondary',
            }}
          >
            - {item.author} ({item.role}, {item.company})
          </Typography>
        </Stack>
        <Box
          component="img"
          src={item.image}
          alt={item.author}
          sx={{
            width: {xs: '80px', md: '120px'},
            height: {xs: '80px', md: '120px'},
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      </Stack>
    );
};

// Main value proposition section
const Testimonials: React.FC = () => {
    return (
        <AnimatedSection
            title="Testimonials"
            subtitle="We develivery rapid value to our customers pipelines"
            id="values"
            bgColor="background.surface"
            sx={{
                position: 'relative',
                zIndex: 1,
                py: {xs: 8, md: 12},
                scrollBehavior: 'smooth',
            }}
        >
            {/* Stats grid */}
            <Sheet
                variant="outlined"
                sx={{
                    borderRadius: 'lg',
                    p: {xs: 3, md: 5},
                    mb: {xs: 6, md: 8},
                    background: 'linear-gradient(145deg, var(--joy-palette-background-level1) 0%, var(--joy-palette-background-surface) 100%)',
                    boxShadow: 'sm',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Grid container spacing={3}>
                    {testimonials.map((testimonial, index) => (
                        <Grid key={index} xs={6} sm={3}>
                            <TestimonialItem
                                item={testimonial}
                                delay={index * 0.1} />
                        </Grid>
                    ))}
                </Grid>

                {/* Background decoration */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-10%',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(58, 134, 255, 0.03) 0%, rgba(58, 134, 255, 0) 70%)',
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}
                />
            </Sheet>
        </AnimatedSection>
    );
};

export default Testimonials;
