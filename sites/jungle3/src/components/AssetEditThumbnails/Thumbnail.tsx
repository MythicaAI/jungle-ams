import AspectRatio from "@mui/joy/AspectRatio";
import Card from "@mui/joy/Card";

import Typography from "@mui/joy/Typography";
import { Box, IconButton, Stack } from "@mui/joy";
import { GripVertical, LucideCircleMinus, LucideLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DownloadInfoResponse } from "../../types/apiTypes";

type Props = {
  removeFile: (file_id: string) => void;
  file: DownloadInfoResponse;
  index: number;
};

export const Thumbnail: React.FC<Props> = ({ file, removeFile, index }) => {
  const navigate = useNavigate();
  return (
    <Card
      sx={{
        position: "relative",
        padding: 0,
        borderColor: index === 0 ? "#0b6bcb" : "auto",
      }}
    >
      <Box
        padding="15px"
        height="100%"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Stack justifyContent="space-between" flexDirection="row">
          <Typography
            level="title-md"
            sx={{
              maxWidth: "150px",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </Typography>
          <span className="dragHandle" style={{ cursor: "grab" }}>
            <GripVertical />
          </span>
        </Stack>
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          mb="10px"
        >
          <Stack flexDirection="row" justifyContent="flex-start" gap="10px">
            <IconButton onClick={() => navigate(`/files/${file.file_id}`)}>
              <LucideLink />
            </IconButton>
            <IconButton onClick={() => removeFile(file.file_id)}>
              <LucideCircleMinus />
            </IconButton>
          </Stack>
          {index === 0 && (
            <Typography
              fontSize="12px"
              display="flex"
              alignItems="center"
              gap="5px"
            >
              Main thumbnail
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="#15cb21"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check"
              >
                <path d="M10 3 4.5 8.5l-2.5 -2.5" />
              </svg>
            </Typography>
          )}
        </Stack>
        <AspectRatio minHeight="80px" maxHeight="200px">
          <Box
            component="img"
            src={file.url}
            alt=""
            sx={{ objectPosition: "center" }}
          />
        </AspectRatio>
      </Box>
    </Card>
  );
};
