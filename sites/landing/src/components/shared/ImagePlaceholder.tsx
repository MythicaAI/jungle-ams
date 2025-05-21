// src/components/shared/ImagePlaceholder.tsx
import React from 'react';
import { Box, Sheet, Typography } from '@mui/joy';

interface ImagePlaceholderProps {
  width?: string | number;
  height?: string | number;
  text?: string;
  bg?: string;
  color?: string;
  borderRadius?: string;
  fontSize?: string;
  sx?: object;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  aspectRatio?: string;
}

// Reusable image placeholder component
export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ 
  width = '100%', 
  height = '100%', 
  text = 'Image', 
  bg = 'primary.100',
  color = 'primary.800',
  borderRadius = 'md',
  fontSize = 'md',
  overlay = false,
  overlayColor = 'black',
  overlayOpacity = 0.3,
  aspectRatio,
  sx = {},
}) => {
  return (
    <Sheet
      variant="outlined"
      sx={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: bg,
        borderRadius,
        position: 'relative',
        overflow: 'hidden',
        aspectRatio,
        ...sx,
      }}
    >
      <Typography 
        level="body1" 
        fontWeight="md" 
        textColor={color}
        fontSize={fontSize}
        sx={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        {text}
      </Typography>
      
      {/* Optional overlay */}
      {overlay && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: overlayColor,
            opacity: overlayOpacity,
            zIndex: 1,
          }}
        />
      )}
      
      {/* Visual elements for futuristic look */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '30%',
          height: '30%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: '40%',
          height: '20%',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
          transform: 'rotate(-15deg)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '25%',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0) 100%)',
          zIndex: 0,
        }}
      />
    </Sheet>
  );
};

export default ImagePlaceholder;