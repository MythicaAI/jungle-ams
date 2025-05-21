// src/components/sections/TeaserContent.tsx
import React from 'react';
import { Box, Grid, Sheet, Typography, Button, Stack } from '@mui/joy';
import AnimatedSection from '../shared/AnimatedSection';
import ImagePlaceholder from '../shared/ImagePlaceholder';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: string;
  colorAccent?: string;
  delay?: number;
}

// Feature card component
const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon = '✨', 
  colorAccent = 'primary.500',
  delay = 0,
}) => {
  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: 'lg',
        p: 3,
        height: '100%',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        borderColor: 'transparent',
        backgroundColor: 'background.surface',
        '&:hover': {
          boxShadow: 'md',
          transform: 'translateY(-5px)',
          '&::before': {
            opacity: 0.1,
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${colorAccent}, transparent)`,
          opacity: 0.05,
          transition: 'opacity 0.3s ease',
        }
      }}
    >
      <Box
        sx={{
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          mb: 2,
          background: `linear-gradient(135deg, ${colorAccent}20, ${colorAccent}10)`,
          color: colorAccent,
        }}
      >
        {icon}
      </Box>
      <Typography level="h4" fontWeight="bold" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography level="body2" sx={{ color: 'text.secondary' }}>
        {description}
      </Typography>
    </Sheet>
  );
};

// Main teaser content section
const TeaserContent: React.FC = () => {
  // Feature data
  const features = [
    {
      title: 'Responsive Design',
      description: 'Fully responsive layouts that adapt to any device and screen size, providing an optimal viewing experience.',
      icon: '📱',
      colorAccent: 'primary.500'
    },
    {
      title: 'Smooth Animations',
      description: 'Beautiful, performant animations and transitions that enhance the user experience without sacrificing performance.',
      icon: '✨',
      colorAccent: 'primary.600'
    },
    {
      title: '3D Elements',
      description: 'Engaging Three.js powered 3D elements that create depth and visual interest while maintaining fast load times.',
      icon: '🧊',
      colorAccent: 'primary.700'
    },
    {
      title: 'Modular Components',
      description: 'Highly reusable component architecture built with TypeScript for maximum flexibility and maintainability.',
      icon: '🧩',
      colorAccent: 'primary.800'
    }
  ];

  return (
    <AnimatedSection 
      title="Key Features"
      subtitle="Discover the powerful capabilities that make our solution stand out from the competition."
      id="features"
      sx={{
        position: 'relative',
        zIndex: 1,
        py: { xs: 8, md: 12 },
      }}
    >
      {/* Feature cards */}
      <Grid 
        container 
        spacing={3} 
        sx={{ mt: 2 }}
      >
        {features.map((feature, index) => (
          <Grid key={index} xs={12} sm={6} md={3}>
            <Box
              sx={{
                opacity: 0,
                transform: 'translateY(20px)',
                animation: 'fadeInUp 0.6s forwards',
                animationDelay: `${0.1 + index * 0.1}s`,
                '@keyframes fadeInUp': {
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
              <FeatureCard 
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                colorAccent={feature.colorAccent}
                delay={index * 0.1}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
      
      {/* Extended feature showcase */}
      <Box sx={{ mt: { xs: 8, md: 12 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid xs={12} md={6}>
            <Stack spacing={3}>
              <Typography
                level="h3"
                fontWeight="bold"
                sx={{
                  opacity: 0,
                  transform: 'translateX(-20px)',
                  animation: 'fadeInRight 0.6s forwards',
                  animationDelay: '0.3s',
                  '@keyframes fadeInRight': {
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
                Elevate Your Digital Experience
              </Typography>
              
              <Typography
                level="body1"
                sx={{
                  opacity: 0,
                  transform: 'translateX(-20px)',
                  animation: 'fadeInRight 0.6s forwards',
                  animationDelay: '0.4s',
                }}
              >
                Our platform combines cutting-edge technology with intuitive design to create engaging, interactive experiences. By focusing on performance and user engagement, we deliver solutions that stand out in today's digital landscape.
              </Typography>
              
              <Box
                sx={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  animation: 'fadeInUp 0.6s forwards',
                  animationDelay: '0.5s',
                  '@keyframes fadeInUp': {
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
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="solid"
                    color="primary"
                    size="lg"
                    sx={{
                      fontWeight: 600,
                      px: 3,
                    }}
                  >
                    Explore Features
                  </Button>
                  <Button
                    variant="outlined"
                    color="neutral"
                    size="lg"
                    sx={{
                      fontWeight: 600,
                      px: 3,
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>
          
          <Grid xs={12} md={6}>
            <Box
              sx={{
                opacity: 0,
                transform: 'translateX(20px)',
                animation: 'fadeInLeft 0.6s forwards',
                animationDelay: '0.6s',
                '@keyframes fadeInLeft': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateX(20px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateX(0)',
                  },
                },
                p: 2,
              }}
            >
              <ImagePlaceholder
                height="300px"
                text="Feature Showcase"
                bg="background.level1"
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
      </Box>
    </AnimatedSection>
  );
};

export default TeaserContent;