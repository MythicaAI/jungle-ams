import { Box } from "@mui/joy";
import {
  extractValidationErrors,
  translateError,
} from "./services/backendCommon";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStatusStore } from "./stores/statusStore";
import LitegraphViewer from "./components/LitegraphViewer";
import { useGetFile } from "./queries/files";

interface FileViewProps {
  file_id?: string;
}

export const FileView = (props: FileViewProps) => {
  const { addError, addWarning } = useStatusStore();
  const { data: file, isLoading, error } = useGetFile(props?.file_id);

  const handleError = (err: any) => {
    addError(translateError(err));
    extractValidationErrors(err).forEach((msg) => addWarning(msg));
  };

  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error]);

  const fileHeader = file ? (
    <Box>
      {file.file_id} {file.name} {file.size} {file.content_type}
    </Box>
  ) : (
    ""
  );

  const isSpecialFile = file?.name && /^.*\.litegraph\.json$/.test(file.name);

  const specialFileView = isSpecialFile ? (
    <Box style={{ height: "100%", width: "100%" }}>
      <h2>Network: {file.name}</h2>
      <LitegraphViewer url={file.url} />
    </Box>
  ) : (
    <Box>{fileHeader}</Box>
  );

  const filePending = <Box>Loading</Box>;

  return <div>{isLoading ? filePending : specialFileView}</div>;
};

export const FileViewWrapper: React.FC = () => {
  const { file_id } = useParams();
  return <FileView file_id={file_id} />;
};
