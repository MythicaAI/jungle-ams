// src/components/sections/SocialLinks.tsx
import React from 'react';
import { Box, Grid, Sheet, Typography, Button, Link, Stack } from '@mui/joy';
import AnimatedSection from '../shared/AnimatedSection';
import { SiGithub, SiArtstation, SiDiscord, SiYoutube, SiX } from '@icons-pack/react-simple-icons';
import { SocialIcon } from 'react-social-icons';

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
        
        <Typography level="body-md" sx={{ color: 'text.secondary', flexGrow: 1 }}>
          {description}
        </Typography>
        
        <Button
          component={Link}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          color="neutral"
          endDecorator="→"
          sx={{
            mt: 'auto',
            borderColor: color,
            color,
            '&:hover': {
              borderColor: color,
              bgcolor: `${color}15`,
            },
          }}
        >
          {linkText}
        </Button>
      </Stack>
    </Sheet>
  );
};

// Main social links section
const SocialLinks: React.FC = () => {
  // Social platforms data
  const platforms = [
    {
      title: 'GitHub',
      icon: <SiGithub size={48} />,
      description: 'Explore our open-source projects, contribute to our codebase, and stay updated with the latest development.',
      linkText: 'View Repositories',
      link: 'https://github.com/MythicaAI',
      color: 'primary.50',
    },
    {
      title: 'Discord',
      icon: <SiDiscord size={48} />,
      description: 'Join our community discussions, get support, and connect with other developers building amazing experiences.',
      linkText: 'Join Community',
      link: 'https://discord.com/invite/mythica',
      color: '#5865F2',
    },
    {
      title: 'YouTube',
      icon: <SiYoutube size={48} />,
      description: 'Watch tutorials, demos, and feature showcases to help you get the most out of our platform.',
      linkText: 'Watch Videos',
      link: 'https://www.youtube.com/@MythicaGG',
      color: '#FF0000',
    },
    {
      title: 'Art Station',
      icon: <SiArtstation size={48} />,
      description: 'Discover design inspirations, mockups, and visual concepts created by our design team.',
      linkText: 'View Designs',
      link: 'https://artstation.com',
      color: '#13AFF0',
    },
    {
      title: 'X (Twitter)',
      icon: <SiX size={48} />,
      description: 'Follow us on social media platforms to stay connected and get the latest news and updates.',
      linkText: 'Follow Us',
      link: 'https://x.com/MythicaAI',
      color: '#1DA1F2',
    },
  ];

  return (
    <AnimatedSection
      title="Connect With Us"
      subtitle="Join our growing community across multiple platforms and be part of our journey."
      id="community"
      bgColor="background.level1"
      sx={{
        position: 'relative',
        zIndex: 1,
        py: { xs: 8, md: 12 },
      }}
    >
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {platforms.map((platform, index) => (
          <Grid key={index} xs={12} sm={6} md={platforms.length > 4 ? 2.4 : 3}>
            <SocialCard
              title={platform.title}
              icon={platform.icon}
              description={platform.description}
              linkText={platform.linkText}
              link={platform.link}
              color={platform.color}
              delay={index * 0.1}
            />
          </Grid>
        ))}
      </Grid>
    </AnimatedSection>
  );
};

export default SocialLinks;