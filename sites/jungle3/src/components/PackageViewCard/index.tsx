import {
  Box,
  Card,
  CardContent,
  CardCover,
  Chip,
  IconButton,
  Typography,
} from "@mui/joy";
import { getThumbnailImg } from "../../lib/packagedAssets.tsx";
import { DownloadButton } from "../DownloadButton";
import { LucideInfo, LucidePackage } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
import { AssetTopResponse } from "../../types/apiTypes.ts";
import { SxProps } from "@mui/joy/styles/types/theme";

type Props = {
  av: AssetTopResponse;
  sxStyles?: SxProps;
  isTopAsset?: boolean;
};

export const PackageViewCard: React.FC<Props> = ({
  av,
  isTopAsset,
  sxStyles,
}) => {
  const navigate = useNavigate();
  return av ? (
    <Card sx={{ height: "100%" }}>
      <CardCover>
        <img
          height="200"
          src={getThumbnailImg(av)}
          loading={"lazy"}
          alt={av.name}
        />
      </CardCover>
      <CardContent sx={sxStyles ?? { justifyContent: "flex-end" }}>
        <Typography
          component="span"
          level="body-lg"
          fontWeight="lg"
          mt={isTopAsset ? 0 : { xs: 12, sm: 18 }}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.6)", // semi-translucent dark background
            color: "white", // white text color for better contrast
            padding: "8px", // some padding to make it look nicer
            borderRadius: "4px", // optional: rounded corners
            width: "100%",
          }}
        >
          {av.org_name}::{av.name}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "8px",
            }}
          >
            <DownloadButton file_id={av.package_id} icon={<LucidePackage />} />
            <IconButton
              sx={{ color: "white" }}
              onClick={() => {
                navigate(
                  `/package-view/${av.asset_id}/versions/${av.version.join(".")}`,
                );
              }}
            >
              <LucideInfo />
            </IconButton>
            <Chip
              key={av.version.join(".")}
              variant="soft"
              color={"neutral"}
              size="lg"
              component={Link}
              to={`/assets/${av.asset_id}/versions/${av.version.join(".")}`}
              sx={{ borderRadius: "xl" }}
            >
              {av.version.join(".")}
            </Chip>
          </Box>
        </Typography>
      </CardContent>
    </Card>
  ) : (
    ""
  );
};
