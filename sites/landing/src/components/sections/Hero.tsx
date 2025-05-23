// src/components/sections/Hero.tsx
import { Box, Container, Typography, Button, Stack, Sheet } from '@mui/joy';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import {ChevronRight, LucidePause, LucidePlay} from 'lucide-react';
import VideoBackground from "../shared/VideoBackground.tsx";
import {Fragment} from "react";
import CrystalHeroScene from "../shared/CrystalHeroScene.tsx";
import {heroVideoContent} from "../../data/media";
import { heroCallToAction } from '../../data/links';

// Hero section with dynamic scroll animations
const Hero = () => {
  const { progress } = useScrollPosition();

  // Grab the first video definition
  const videoSrc = heroVideoContent[0].videoSrc;
  const videoSrcFallbackImg = heroVideoContent[0].videoSrcImageFallback;

  // Animation values based on scroll progress
  const titleOpacity = 1 - progress * 2;  // Fade out faster
  const titleTranslate = progress * -100;  // Move up as scroll begins
  const heroScale = 1 - progress * 0.1;    // Slight zoom out

    const getVideoControlIcon = () => {
        const video = document.querySelector('video');
        if (!video) {
            return <Fragment/>;
        }
        if (video.paused) {
            return <LucidePlay />
        }
        return <LucidePause />
    }
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
        {/* Video Background */}
      {videoSrc && (
        <VideoBackground
          src={videoSrc}
          fallbackImage={videoSrcFallbackImg}
          overlay={true}
          overlayOpacity={0.5}
          overlayColor="rgba(0, 0, 0, 0.5)"
          onLoadedData={() => console.log('loaded') }
          onError={() => console.log('Video failed to load')}
        />
      )}

      {/* Content overlay */}
      <Container
        maxWidth="lg"

        sx={{
          position: 'relative',
          zIndex: 1,
          pt: { xs: 16, md: 8 },
          transform: `scale(${heroScale})`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Hero Text Content */}
          <Box
            sx={{
              maxWidth: { xs: '100%', md: '45%' },
              textAlign: { xs: 'center', md: 'left' },

              transform: `translateY(${titleTranslate}px)`,
              opacity: titleOpacity,
              transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
            }}
          >
            <Typography
              component="h1"
              level="h1"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '2.0rem', md: '2.5rem', lg: '3rem' },
                lineHeight: 1.1,
                fontFamily: 'var(--joy-fontFamily-display)',
                background: 'linear-gradient(90deg, var(--joy-palette-primary-500) 30%, var(--joy-palette-primary-600) 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Immersive Worlds Powered by Open Source
            </Typography>

            <Typography
              level="body-md"
              sx={{
                fontSize: { xs: 'md', md: 'lg' },
                mb: 4,
                opacity: 0.85,
              }}
            >
              10x your game asset pipeline with our CreativeOps team and advanced tooling.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent={{ xs: 'center', md: 'flex-start' }}
            >
              <Button
                  variant="solid"
                  size="lg"
                  onClick={() => window.open(heroCallToAction, '_blank')}
                  endDecorator={<ChevronRight size={20} />}
                  sx={{
                    backgroundColor: '#4c6ef5',
                    borderRadius: '50px',
                    px: 4,
                    py: 1.5,
                    fontSize: '16px',
                    fontWeight: 500,
                    textTransform: 'none',

                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 20px rgba(76, 110, 245, 0.3)',
                    '&:hover': {
                      backgroundColor: '#4264ea',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 25px rgba(76, 150, 245, 0.4)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                    Try our Tools
                </Button>
            </Stack>
          </Box>

          {/* Hero Image Placeholder */}
          <Box
            sx={{
              width: { xs: '100%', md: '50%' },
              aspectRatio: '16/9',
              opacity: titleOpacity,
              transform: `translateY(${titleTranslate * 0.5}px)`,
              transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
            }}
          >
            <CrystalHeroScene />
          </Box>
        </Stack>
      </Container>

        {/* Video controls (optional) */}
      {videoSrc && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 15,
            display: 'flex',
            gap: 1,
          }}
        >
          <Button
            size="sm"
            variant="soft"
            color="neutral"
            sx={{
              minWidth: 'auto',
              px: 2,
              opacity: 0.8,
              '&:hover': { opacity: 1 },
            }}
            onClick={() => {
                const video = document.querySelector('video');
              if (video) {
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }
            }}
          >
              { getVideoControlIcon() }
          </Button>
          <Button
            size="sm"
            variant="soft"
            color="neutral"
            sx={{
              minWidth: 'auto',
              px: 2,
              opacity: 0.8,
              '&:hover': { opacity: 1 },
            }}
            onClick={() => {
              const video = document.querySelector('video');
              if (video) {
                video.muted = !video.muted;
              }
            }}
          >
            🔊
          </Button>
        </Box>
      )}

      {/* Scroll indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 1 - progress * 3, // Fade out quickly when scrolling
          transition: 'opacity 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography level="body-md" sx={{ mb: 1, opacity: 0.7 }}>
          Scroll Down
        </Typography>
        <Box
          sx={{
            width: 30,
            height: 50,
            border: '2px solid',
            borderColor: 'primary.300',
            borderRadius: 30,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 8,
              left: '50%',
              width: 6,
              height: 6,
              backgroundColor: 'primary.400',
              borderRadius: '50%',
              transform: 'translateX(-50%)',
              animation: 'scrollDown 2s infinite',
            },
            '@keyframes scrollDown': {
              '0%': {
                opacity: 1,
                top: 8,
              },
              '100%': {
                opacity: 0,
                top: 32,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default Hero;
