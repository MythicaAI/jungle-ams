import React, { useState } from "react";
import { Box, Skeleton } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  width: string | number;
  height: string | number;
  position?: React.CSSProperties["position"];
  containerMargin?: string;
  sx?: SxProps;
  onClick?: () => void;
}

const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  width,
  height,
  position = "relative",
  containerMargin,
  onClick,
  sx,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      onClick={onClick}
      style={{ width, height, position: position, margin: containerMargin }}
    >
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          animation="wave"
        />
      )}
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: "100%",
          height: "100%",
          display: isLoading ? "none !important" : "block",
          ...sx,
        }}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default ImageWithSkeleton;
