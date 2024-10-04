import React, { useState } from "react";
import { Box, IconButton, AspectRatio, Skeleton } from "@mui/joy";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AssetVersionContent, AssetVersionResponse } from "types/apiTypes.ts";

export interface PackageViewCarouselProps {
  thumbnails?: string[];
}

interface ImageRef {
  file_name: string;
  url: string;
}

const assetContentToImageRef = (avc: AssetVersionContent): ImageRef => {
  const file_name = avc.file_name;
  const content_hash = avc.content_hash;
  const extension = file_name.split(".")[1];
  const baseUrl = import.meta.env.VITE_IMAGES_BASE_URL;
  return {
    file_name: file_name,
    url: `${baseUrl}/${content_hash}.${extension}`,
  };
};

const getAssetVersionThumbnails = (av: AssetVersionResponse): ImageRef[] => {
  if (av && "contents" in av && "thumbnails" in av.contents) {
    return av.contents["thumbnails"].map((content) =>
      assetContentToImageRef(content),
    );
  }
  return [];
};

const PackageViewCarousel: React.FC<AssetVersionResponse> = (av) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbnailRefs = getAssetVersionThumbnails(av);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? thumbnailRefs.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === thumbnailRefs.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return thumbnailRefs.length == 0 ? (
    <Skeleton
      animation={false}
      width={800}
      height={600}
      sx={{ borderRadius: "6px" }}
    />
  ) : (
    <Box
      sx={{
        width: "100%",
        maxWidth: 600,
        margin: "auto",
        position: "relative",
      }}
    >
      <AspectRatio
        ratio="4/3"
        sx={{ background: "transparent", borderRadius: "8px" }}
      >
        <img
          src={thumbnailRefs[currentIndex].url}
          alt={`${thumbnailRefs[currentIndex].file_name}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      </AspectRatio>

      <IconButton
        onClick={goToPrevious}
        sx={{
          position: "absolute",
          top: "50%",
          left: 10,
          transform: "translateY(-50%)",
        }}
      >
        <ChevronLeft />
      </IconButton>

      <IconButton
        onClick={goToNext}
        sx={{
          position: "absolute",
          top: "50%",
          right: 10,
          transform: "translateY(-50%)",
        }}
      >
        <ChevronRight />
      </IconButton>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        {thumbnailRefs.map((_, slideIndex) => (
          <Box
            key={slideIndex}
            sx={{
              width: 50,
              height: 50,
              backgroundImage: `url(${thumbnailRefs[slideIndex].url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: slideIndex === currentIndex ? "2px solid blue" : "none",
              margin: "0 5px",
              cursor: "pointer",
            }}
            onClick={() => goToSlide(slideIndex)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PackageViewCarousel;
