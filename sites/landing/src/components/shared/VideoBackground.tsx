
// Video background component
import {Box} from "@mui/joy";
import {useEffect, useImperativeHandle, useRef, useState} from "react";

interface VideoBackgroundProps {
  ref: HTMLVideoElement;
  src: string;
  fallbackImage?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
  muted?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  playsInline?: boolean;
  poster?: string;
  onLoadedData?: () => void;
  onError?: () => void;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
                                                           src,
                                                           fallbackImage,
                                                           overlay = true,
                                                           overlayOpacity = 0.4,
                                                           overlayColor = 'rgba(0, 0, 0, 0.4)',
                                                           muted = true,
                                                           loop = true,
                                                           autoplay = true,
                                                           playsInline = true,
                                                           poster,
                                                           onLoadedData,
                                                           onError,
                                                         }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoaded(true);
      if (onLoadedData) onLoadedData();
    };

    const handleError = () => {
      setHasError(true);
      if (onError) onError();
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    // Attempt to play the video
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Auto-play was prevented, that's okay
        console.log('Video autoplay was prevented');
      });
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [onLoadedData, onError]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Video element */}
      {!hasError && (
        <video
            id="video"
          ref={videoRef}
          src={src}
          poster={poster || fallbackImage}
          muted={muted}
          loop={loop}
          autoPlay={autoplay}
          playsInline={playsInline}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
          }}
        />
      )}

      {/* Fallback image for when video fails or is loading */}
      {(hasError || !isLoaded) && fallbackImage && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${fallbackImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Overlay */}
      {overlay && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
            zIndex: 1,
          }}
        />
      )}
    </Box>
  );
};

export default VideoBackground;
