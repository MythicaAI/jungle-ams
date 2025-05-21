// src/components/layout/Footer.tsx
import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, Stack, IconButton, Sheet } from '@mui/joy';

// Footer navigation item interface
interface FooterNavItem {
  label: string;
  href: string;
}

// Footer navigation section interface
interface FooterNavSection {
  title: string;
  items: FooterNavItem[];
}

// Main Footer component
const Footer: React.FC = () => {
  // Footer navigation data
  const navSections: FooterNavSection[] = [
    {
      title: 'Product',
      items: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Documentation', href: '#docs' },
        { label: 'Roadmap', href: '#roadmap' },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: 'About', href: '#about' },
        { label: 'Team', href: '#team' },
        { label: 'Careers', href: '#careers' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Resources',
      items: [
        { label: 'Blog', href: '#blog' },
        { label: 'Tutorials', href: '#tutorials' },
        { label: 'Support', href: '#support' },
        { label: 'FAQs', href: '#faqs' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Cookie Policy', href: '#cookies' },
        { label: 'Accessibility', href: '#accessibility' },
      ],
    },
  ];

  // Social links data
  const socialLinks = [
    { icon: '📱', href: '#', label: 'Twitter' },
    { icon: '💼', href: '#', label: 'LinkedIn' },
    { icon: '📸', href: '#', label: 'Instagram' },
    { icon: '🎥', href: '#', label: 'YouTube' },
    { icon: '💻', href: '#', label: 'GitHub' },
  ];

  return (
    <Box component="footer" sx={{ bgcolor: 'background.level1', py: 6, mt: 8 }}>
      <Container maxWidth="lg">
        {/* Newsletter section */}
        <Sheet 
          variant="outlined"
          sx={{ 
            p: 4, 
            mb: 6, 
            borderRadius: 'lg',
            background: 'linear-gradient(145deg, var(--joy-palette-background-level1) 0%, var(--joy-palette-background-surface) 100%)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid xs={12} md={6} lg={7}>
              <Typography level="h4" fontWeight="bold" sx={{ mb: 1 }}>
                Stay Updated
              </Typography>
              <Typography level="body2" sx={{ color: 'text.secondary' }}>
                Subscribe to our newsletter to receive the latest updates, features, and news.
              </Typography>
            </Grid>
            <Grid xs={12} md={6} lg={5}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={1} 
                sx={{ 
                  width: '100%',
                  '& .MuiInput-root': {
                    borderTopRightRadius: { sm: 0 },
                    borderBottomRightRadius: { sm: 0 },
                  },
                  '& .MuiButton-root': {
                    borderTopLeftRadius: { sm: 0 },
                    borderBottomLeftRadius: { sm: 0 },
                  }
                }}
              >
                <Sheet 
                  component="input"
                  placeholder="Your email address" 
                  variant="outlined"
                  color="neutral"
                  sx={{ 
                    p: 1.5,
                    flexGrow: 1,
                    borderRadius: 'md',
                    fontFamily: 'inherit',
                    fontSize: 'sm',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:focus': {
                      outline: 'none',
                      borderColor: 'primary.500',
                      boxShadow: '0 0 0 3px rgba(58, 134, 255, 0.1)',
                    }
                  }}
                />
                <Sheet
                  component="button"
                  variant="solid"
                  color="primary"
                  sx={{
                    p: 1.5,
                    borderRadius: 'md',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    minWidth: '120px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'primary.600',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  Subscribe
                </Sheet>
              </Stack>
            </Grid>
          </Grid>
        </Sheet>
        
        {/* Navigation grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {navSections.map((section, index) => (
            <Grid key={index} xs={6} sm={3}>
              <Typography level="title-md" fontWeight="bold" sx={{ mb: 2 }}>
                {section.title}
              </Typography>
              <Stack spacing={1.5}>
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    level="body2"
                    underline="none"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.500',
                      },
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Company info and social links */}
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={6}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography
                level="h5"
                component="span"
                sx={{
                  fontFamily: 'var(--joy-fontFamily-display)',
                  background: 'linear-gradient(90deg, var(--joy-palette-primary-500) 0%, var(--joy-palette-primary-600) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  mr: 1,
                }}
              >
                LANDING SPA
              </Typography>
              <Typography level="body2" sx={{ color: 'text.secondary' }}>
                © {new Date().getFullYear()} All rights reserved.
              </Typography>
            </Stack>
          </Grid>
          
          <Grid xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
              {socialLinks.map((link, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="plain"
                  color="neutral"
                  size="sm"
                  aria-label={link.label}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'primary.50',
                      color: 'primary.600',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  {link.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;