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
import { motion } from "framer-motion";

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
      sx={{
        padding: 0,
        height: "210px",
        cursor: "pointer",
        overflow: "hidden",
      }}
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
      <CardContent
        sx={{
          ...(sxStyles ?? { justifyContent: "flex-end" }),
        }}
      >
        <motion.div
          initial={{ height: "61px" }}
          animate={{ height: showVersion ? "78px" : "61px" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
          }}
        >
          <Typography
            component="span"
            level="body-lg"
            fontWeight="lg"
            textAlign="start"
            sx={{
              color: "white", // white text color for better contrast
              padding: "8px", // some padding to make it look nicer
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              wordBreak: "break-word",

              height: showVersion ? "78px" : "61px",
              transition: "max-height 0.3 ease",
              ...(!av.owner_name &&
                !showVersion && { display: "flex", alignItems: "center" }),
            }}
          >
            {av.name}

            {(av.owner_name || showVersion) && (
              <Stack direction="row" justifyContent="space-between">
                <Typography
                  fontSize={12}
                  sx={{ display: "block", color: "#b1b1b1" }}
                >
                  {av.owner_name}
                </Typography>

                {showVersion && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
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
                  </motion.div>
                )}
              </Stack>
            )}
          </Typography>
        </motion.div>
      </CardContent>
    </Card>
  ) : (
    ""
  );
};
