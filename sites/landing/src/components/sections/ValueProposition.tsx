// src/components/sections/ValueProposition.tsx
import React from 'react';
import {Box, Typography, Grid, Stack, Sheet, Divider} from '@mui/joy';
import AnimatedSection from '../shared/AnimatedSection';
import ImagePlaceholder from '../shared/ImagePlaceholder';
import { valuePoints, valueStats, type ValuePointProps } from '../../data/valueProps';

interface StatItemProps {
    value: string;
    label: string;
    delay?: number;
}

// Animated statistic item
const StatItem: React.FC<StatItemProps> = ({value, label, delay = 0}) => {
    return (
        <Stack
            spacing={1}
            sx={{
                textAlign: 'center',
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
            <Typography
                level="h2"
                fontWeight="bold"
                sx={{
                    background: 'linear-gradient(90deg, var(--joy-palette-primary-500) 0%, var(--joy-palette-primary-600) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: {xs: '2rem', md: '2.5rem'},
                }}
            >
                {value}
            </Typography>
            <Typography level="body-md" sx={{color: 'text.secondary'}}>
                {label}
            </Typography>
        </Stack>
    );
};

const ValuePoint: React.FC<ValuePointProps> = ({icon, title, description, delay}) => {
    if (!delay) {
        delay = 0;
    }
    return (
        <Stack
            direction="row"
            spacing={2}
            sx={{
                willChange: 'transform, opacity',
                opacity: 0,
                transform: 'translateX(-20px)',
                animation: 'slideIn 0.6s forwards ease-out',
                animationDelay: `${0.3 + delay}s`,
                '@keyframes slideIn': {
                    '0%': {
                        opacity: 0,
                        transform: 'translateX(-20px)',
                    },
                    '100%': {
                        opacity: 1,
                        transform: 'translateX(0)',
                    },
                },
            }}
        >
            <Box
                sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'primary.100',
                    color: 'primary.600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Stack spacing={0.5}>
                <Typography level="title-md" fontWeight="bold">
                    {title}
                </Typography>
                <Typography level="body-sm" sx={{color: 'text.secondary'}}>
                    {description}
                </Typography>
            </Stack>
        </Stack>
    );
};

// Main value proposition section
const ValueProposition: React.FC = () => {
    return (
        <AnimatedSection
            title="Why Choose Us"
            subtitle="We're committed to providing the most advanced and user-friendly platform for your digital needs."
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
                    {valueStats.map((stat, index) => (
                        <Grid key={index} xs={6} sm={3}>
                            <StatItem
                                value={stat.value}
                                label={stat.label}
                                delay={index * 0.1}
                            />
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

            {/* Value proposition content */}
            <Grid container spacing={6} alignItems="center">
                <Grid xs={12} md={6} order={{xs: 2, md: 1}}>
                    <Stack spacing={4}>
                        <Typography
                            level="h3"
                            fontWeight="bold"
                            sx={{
                                willChange: 'transform, opacity',
                                opacity: 0,
                                transform: 'translateY(20px)',
                                animation: 'fadeIn 0.6s forwards ease-out',
                                animationDelay: '0.1s',
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
                            Transform Your Digital Presence
                        </Typography>

                        <Divider sx={{
                            willChange: 'opacity',
                            opacity: 0,
                            animation: 'fadeIn 0.6s forwards ease-out',
                            animationDelay: '0.2s',
                        }}/>

                        <Stack spacing={3}>
                            {valuePoints.map((point, index) => (
                                <ValuePoint
                                    key={index}
                                    icon={point.icon}
                                    title={point.title}
                                    description={point.description}
                                    delay={index * 0.1}
                                />
                            ))}
                        </Stack>
                    </Stack>
                </Grid>

                <Grid xs={12} md={6} order={{xs: 1, md: 2}}>
                    <Box
                        sx={{
                            willChange: 'transform, opacity',
                            opacity: 0,
                            transform: 'translateX(20px)',
                            animation: 'slideInRight 0.6s forwards ease-out',
                            animationDelay: '0.3s',
                            '@keyframes slideInRight': {
                                '0%': {
                                    opacity: 0,
                                    transform: 'translateX(20px)',
                                },
                                '100%': {
                                    opacity: 1,
                                    transform: 'translateX(0)',
                                },
                            },
                        }}
                    >
                        <ImagePlaceholder
                            height="400px"
                            text="Value Communication"
                            bg="primary.50"
                            color="primary.700"
                            borderRadius="lg"
                            fontSize="md"
                            sx={{
                                boxShadow: 'lg',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </AnimatedSection>
    );
};

export default ValueProposition;