import { AspectRatio } from '@mui/joy';
import React from "react";

interface ThumbnailProps {
    src: string;
    alt: string;
}
export const Thumbnail: React.FC<ThumbnailProps> = ({ src, alt }) => (
  <AspectRatio ratio="1" sx={{ width: 100, height: 100 }}>
    <img
      src={src}
      alt={alt}
      style={{
        objectFit: 'cover',
        width: '100%',
        height: '100%',
      }}
    />
  </AspectRatio>
);