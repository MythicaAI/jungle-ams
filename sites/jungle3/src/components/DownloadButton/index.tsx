import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/joy";
import {
  extractValidationErrors,
  translateError,
} from "../../services/backendCommon.ts";
import { useStatusStore } from "../../stores/statusStore.ts";
import { ReactNode } from "react";
import { useDownloadFile } from "../../queries/common/index.ts";

interface DownloadButtonProps {
  file_id: string;
  icon: ReactNode;
  text?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  file_id,
  icon,
  text,
}) => {
  const { addError, addWarning } = useStatusStore();
  const [shouldDownload, setShouldDownload] = useState(false);
  const { data: downloadedFile, error } = useDownloadFile({
    id: file_id,
    shouldDownload,
  });

  const handleError = (err: any) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error]);

  useEffect(() => {
    if (downloadedFile) {
      const link = document.createElement("a");
      link.href = downloadedFile.url;
      link.setAttribute("download", downloadedFile.name); // Specify the filename for download
      document.body.appendChild(link);
      link.click();

      link.remove();
      setShouldDownload(false);
    }
  }, [downloadedFile]);

  const handleDownload = () => {
    setShouldDownload(true);
  };

  return (
    <IconButton onClick={handleDownload}>
      {icon} {text ? text : ""}
    </IconButton>
  );
};
