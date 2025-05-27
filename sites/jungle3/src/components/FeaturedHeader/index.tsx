import React from "react";
import { Box, Typography, Button, Stack } from "@mui/joy";
import { AssetTopResponse } from "types/apiTypes";
import { getThumbnailImg } from "@lib/packagedAssets";
import { LucideExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ImageWithSkeleton from "@components/common/ImageWithSkeleton";

type FeaturedHeaderProps = {
  asset: AssetTopResponse;
};

export const FeaturedHeader: React.FC<FeaturedHeaderProps> = ({ asset }) => {
  const navigate = useNavigate();

  const handleViewPackage = () => {
    navigate(`/package-view/${asset.asset_id}/versions/${asset.version.join(".")}`);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "400px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={handleViewPackage}
    >
      {/* Background Image - Full Size */}
      <ImageWithSkeleton
        src={getThumbnailImg(asset)}
        alt={asset.name}
        width="100%"
        height="100%"
        sx={{
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />
      
      {/* Dark Overlay for Text Readability */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)",
          zIndex: 2,
        }}
      />
      
      {/* Bottom Left - Content */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          padding: "32px",
          zIndex: 3,
          color: "white",
        }}
      >
        <Stack spacing={0.5}>
          <Typography
            level="body-lg"
            sx={{
              fontSize: "3.0rem",
              fontWeight: "lg",
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
              lineHeight: 1.2,
              textAlign: "start",
            }}
          >
            {asset.name}
          </Typography>
          
          {asset.owner_name && (
            <Typography
              sx={{
                fontSize: "16px",
                color: "#b1b1b1",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                textAlign: "start",
              }}
            >
              {asset.owner_name}
            </Typography>
          )}
        </Stack>
      </Box>
      
      {/* Bottom Right - Try It Button */}
      <Box
        sx={{
          position: "absolute",
          bottom: 32,
          right: 32,
          zIndex: 3,
        }}
      >
        <Button
          variant="solid"
          color="success"
          size="lg"
          startDecorator={<LucideExternalLink size={20} />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewPackage();
          }}
          sx={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "16px 24px",
            fontSize: "1.1rem",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.2s ease",
          }}
        >
          Try It
        </Button>
      </Box>
    </Box>
  );
}; 