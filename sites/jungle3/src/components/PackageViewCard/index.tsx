import React from "react";
import {
  Card,
  CardContent,
  CardCover,
  Chip,
  Stack,
  Typography,
} from "@mui/joy";
import { getThumbnailImg } from "@lib/packagedAssets";
import { DownloadButton } from "@components/common/DownloadButton";
import { LucidePackage } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AssetTopResponse } from "types/apiTypes";
import { SxProps } from "@mui/joy/styles/types/theme";

type Props = {
  av: AssetTopResponse;
  sxStyles?: SxProps;
  isTopAsset?: boolean;
};

export const PackageViewCard: React.FC<Props> = ({ av, sxStyles }) => {
  const navigate = useNavigate();
  const [showVersion, setShowVersion] = React.useState(false);
  return av ? (
    <Card
      sx={{ padding: 0, height: "210px", cursor: "pointer" }}
      onMouseEnter={() => setShowVersion(true)}
      onMouseLeave={() => setShowVersion(false)}
      onClick={() => {
        navigate(
          `/package-view/${av.asset_id}/versions/${av.version.join(".")}`,
        );
      }}
    >
      <CardCover>
        <img
          height="200"
          src={getThumbnailImg(av)}
          loading={"lazy"}
          alt={av.name}
        />
      </CardCover>
      <CardContent sx={{ ...(sxStyles ?? { justifyContent: "flex-end" }) }}>
        <Typography
          component="span"
          level="body-lg"
          fontWeight="lg"
          textAlign="start"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "white", // white text color for better contrast
            padding: "8px", // some padding to make it look nicer
            width: "100%",
            height: showVersion ? "78px" : "61px",
            ...(!av.org_name &&
              !showVersion && { display: "flex", alignItems: "center" }),
          }}
        >
          {av.name}

          {(av.org_name || showVersion) && (
            <Stack direction="row" justifyContent="space-between">
              <Typography
                fontSize={12}
                sx={{ display: "block", color: "#b1b1b1" }}
              >
                {av.org_name}
              </Typography>
              {showVersion && (
                <Stack
                  direction="row"
                  gap="4px"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DownloadButton
                    file_id={av.package_id}
                    icon={<LucidePackage />}
                  />
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
                </Stack>
              )}
            </Stack>
          )}
        </Typography>
      </CardContent>
    </Card>
  ) : (
    ""
  );
};
