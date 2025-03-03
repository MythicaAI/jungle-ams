import { CircularProgress, Stack, Typography } from "@mui/joy";
import { useGetFile } from "@queries/files";
import React from "react";
import { DownloadButton } from "./common/DownloadButton";
import { LucideDownload } from "lucide-react";

const JobResultFile: React.FC<{
  id: string;
  progress: number;
  itemType: string;
}> = ({ id, progress, itemType }) => {
  const { data, isLoading } = useGetFile(id);
  const isError = itemType === "error";
  const isFinished = progress === 100;

  if (isLoading) return <CircularProgress />;

  return (
    <Stack direction="row" alignItems="center" gap="8px" mb="8px">
      {isFinished && <Typography>{data?.name}</Typography>}
      {isError && <Typography>Error</Typography>}
      {progress < 100 && !isError && (
        <>
          <Typography>In progress</Typography>
          <CircularProgress size="sm" determinate value={progress} />
        </>
      )}
      {!isError && isFinished && (
        <DownloadButton icon={<LucideDownload />} file_id={id} />
      )}
    </Stack>
  );
};

export default JobResultFile;
