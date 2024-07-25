import { Box } from "@mui/joy";
import { FileInfoResponse } from "./types/apiTypes";
import {
  extractValidationErrors,
  translateError,
} from "./services/backendCommon";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AxiosError } from "axios";
import { useStatusStore } from "./stores/statusStore";
import { api } from "./services/api";
import LitegraphViewer from "./components/LitegraphViewer";

interface FileViewProps {
  file_id?: string;
}

export const FileView = (props: FileViewProps) => {
  const { addError, addWarning } = useStatusStore();
  const [file, setFile] = useState({} as unknown as FileInfoResponse);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).forEach((msg) => addWarning(msg));
  };

  useEffect(() => {
    if (!props.file_id) {
      return;
    }

    api
      .get<FileInfoResponse>({ path: `/download/info/${props.file_id}` })
      .then((r) => {
        const fileInfo = r as FileInfoResponse;
        setFile(fileInfo);
        setIsLoading(false);
      })
      .catch((err) => handleError(err));
  }, [props.file_id]);

  const fileHeader = file ? (
    <Box>
      {file.file_id} {file.name} {file.size} {file.content_type}
    </Box>
  ) : (
    ""
  );

  const isSpecialFile = file.name && /^.*\.litegraph\.json$/.test(file.name);

  const specialFileView = isSpecialFile ? (
    <Box style={{ height: '100%', width: '100%' }}>
      <h2>Network: {file.name}</h2>
      <LitegraphViewer url={file.url} />
    </Box>
  ) : (
    <Box>
      {fileHeader}
    </Box>
  );

  const filePending = <Box>Loading</Box>;

  return <div>{isLoading ? filePending : specialFileView}</div>;
};

export const FileViewWrapper: React.FC = () => {
  const { file_id } = useParams();
  return <FileView file_id={file_id} />;
};
