// src/components/sections/TeamSection.tsx
import React from 'react';
import { Box, Grid, Sheet, Typography, Stack, IconButton } from '@mui/joy';
import AnimatedSection from '../shared/AnimatedSection';
import ImagePlaceholder from '../shared/ImagePlaceholder';

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  imageText?: string;
  socialLinks?: Array<{ icon: string; url: string; }>;
  delay?: number;
}

// Team member card component
const TeamMember: React.FC<TeamMemberProps> = ({ 
  name, 
  role, 
  bio, 
  imageText = 'Team Member', 
  socialLinks = [],
  delay = 0
}) => {
  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: 'lg',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        height: '100%',
        opacity: 0,
        transform: 'translateY(20px)',
        animation: 'fadeIn 0.6s forwards',
        animationDelay: `${0.2 + delay}s`,
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 'md',
          '& .member-image': {
            transform: 'scale(1.05)',
          },
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
      {/* Member image */}
      <Box
        className="member-image"
        sx={{
          height: '220px',
          overflow: 'hidden',
          transition: 'transform 0.5s ease',
        }}
      >
        <ImagePlaceholder
          height="100%"
          text={imageText}
          bg="primary.100"
          color="primary.800"
          borderRadius="none"
          fontSize="md"
        />
      </Box>
      
      {/* Member info */}
      <Box sx={{ p: 3 }}>
        <Typography level="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
          {name}
        </Typography>
        <Typography
          level="body2"
          sx={{
            color: 'primary.600',
            fontWeight: 500,
            mb: 2,
          }}
        >
          {role}
        </Typography>
        <Typography level="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {bio}
        </Typography>
        
        {/* Social links */}
        {socialLinks.length > 0 && (
          <Stack direction="row" spacing={1}>
            {socialLinks.map((link, index) => (
              <IconButton
                key={index}
                component="a"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="plain"
                color="neutral"
                size="sm"
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'primary.50',
                    color: 'primary.600',
                  }
                }}
              >
                {link.icon}
              </IconButton>
            ))}
          </Stack>
        )}
      </Box>
    </Sheet>
  );
};

// Main team section
const TeamSection: React.FC = () => {
  // Team members data
  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      bio: 'Leading our vision and strategy with over 10 years of experience in the digital space.',
      imageText: 'Alex J.',
      socialLinks: [
        { icon: '🔗', url: '#' },
        { icon: '💼', url: '#' },
      ],
    },
    {
      name: 'Sam Rodriguez',
      role: 'Lead Designer',
      bio: 'Bringing creative vision to life with expertise in UX/UI and visual design systems.',
      imageText: 'Sam R.',
      socialLinks: [
        { icon: '🎨', url: '#' },
        { icon: '🔗', url: '#' },
      ],
    },
    {
      name: 'Taylor Kim',
      role: 'Senior Developer',
      bio: 'Building robust, scalable solutions with deep knowledge of modern web technologies.',
      imageText: 'Taylor K.',
      socialLinks: [
        { icon: '💻', url: '#' },
        { icon: '🔗', url: '#' },
      ],
    },
    {
      name: 'Jordan Patel',
      role: 'Marketing Specialist',
      bio: 'Crafting compelling narratives and growth strategies to expand our reach.',
      imageText: 'Jordan P.',
      socialLinks: [
        { icon: '📣', url: '#' },
        { icon: '🔗', url: '#' },
      ],
    },
  ];

  return (
    <AnimatedSection
      title="Meet Our Team"
      subtitle="The talented people behind our success, working together to bring your vision to life."
      id="team"
      bgColor="background.level1"
      sx={{
        position: 'relative',
        zIndex: 1,
        py: { xs: 8, md: 12 },
      }}
    >
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {teamMembers.map((member, index) => (
          <Grid key={index} xs={12} sm={6} md={3}>
            <TeamMember
              name={member.name}
              role={member.role}
              bio={member.bio}
              imageText={member.imageText}
              socialLinks={member.socialLinks}
              delay={index * 0.1}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Team values statement */}
      <Box sx={{ mt: { xs: 6, md: 8 } }}>
        <Sheet
          variant="soft"
          color="primary"
          sx={{
            borderRadius: 'lg',
            py: 4,
            px: { xs: 3, md: 6 },
            position: 'relative',
            overflow: 'hidden',
            opacity: 0,
            transform: 'translateY(20px)',
            animation: 'fadeIn 0.6s forwards',
            animationDelay: '0.5s',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid xs={12} md={8}>
              <Typography level="h3" fontWeight="bold" sx={{ mb: 2 }}>
                Join Our Growing Team
              </Typography>
              <Typography level="body1">
                We're always looking for talented individuals who are passionate about creating exceptional digital experiences. If you're creative, driven, and collaborative, we'd love to hear from you.
              </Typography>
            </Grid>
            <Grid xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Sheet
                component="a"
                href="#careers"
                variant="solid"
                color="primary"
                sx={{
                  py: 1,
                  px: 3,
                  display: 'inline-block',
                  borderRadius: 'md',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  boxShadow: 'sm',
                  '&:hover': {
                    boxShadow: 'md',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                View Open Positions →
              </Sheet>
            </Grid>
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
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        </Sheet>
      </Box>
    </AnimatedSection>
  );
};

export default TeamSection;