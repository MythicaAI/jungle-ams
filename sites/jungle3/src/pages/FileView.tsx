import { Box } from "@mui/joy";
import {
  extractValidationErrors,
  translateError,
} from "@services/backendCommon";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStatusStore } from "@store/statusStore";
import LitegraphViewer from "@components/LitegraphViewer";
import { useGetFile } from "@queries/files";
import BabylonViewer from "@components/BabylonViewer/BabylonViewer";

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


  const specialFileView = file ? (
    <Box style={{ height: "100%", width: "100%" }}>
      {file?.name && /^.*\.litegraph\.json$/.test(file.name) ? (
        <>
        <h2>Network: {file.name}</h2>
        <LitegraphViewer url={file.url} />
      </>
      ) : file.content_type === 'application/gltf' ||
        file.content_type === 'application/glb' ? (
        <BabylonViewer
          src={file.url}
          style={{
            height: '100vh',
            width: '100vh',
            minHeight: '480px',
            minWidth: '640px',
          }}
        />
      ):<></>}
    
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

export default FileViewWrapper;
