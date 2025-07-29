import { UploadProgressState, useUploadStore } from "@store/uploadStore";
import { Box, Button, LinearProgress } from "@mui/joy";
import { LucideCloudUpload } from "lucide-react";

interface UploadButtonProps {
  onUploadFiles: () => void;
}

export const UploadButton: React.FC<UploadButtonProps> = (props) => {
  const { progress, progressState, pendingUploads } = useUploadStore();

  switch (progressState) {
    default:
    case UploadProgressState.None:
      return (
        <Button
          startDecorator={<LucideCloudUpload />}
          color="primary"
          onClick={props.onUploadFiles}
        >
          Upload {pendingUploads.length} Files
        </Button>
      );
    case UploadProgressState.InProgress:
      return (
        <Box>
          <Button
            startDecorator={<LucideCloudUpload />}
            loading
            color="primary"
          >
            Uploading {pendingUploads.length} Files
          </Button>
          <LinearProgress value={progress} />
        </Box>
      );
    case UploadProgressState.Finished:
      return (
        <Box>
          <Button startDecorator={<LucideCloudUpload />} color="primary">
            Uploaded {pendingUploads.length} Files
          </Button>
        </Box>
      );
  }
};
