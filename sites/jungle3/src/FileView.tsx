import {
    Box,
} from '@mui/joy';
import {FileUploadResponse} from "./types/apiTypes.ts";
import {extractValidationErrors, getData, translateError} from "./services/backendCommon.ts";
import { useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {AxiosError} from "axios";
import {useStatusStore} from "./stores/statusStore.ts";
import {StatusStack} from "./components/StatusStack.tsx";

interface FileViewProps {
    file_id?: string,
}

export const FileView = (props: FileViewProps) => {
    const {addError, addWarning} = useStatusStore();
    const [file, setFile] = useState({} as unknown as FileUploadResponse);

    const handleError = (err: AxiosError) => {
        addError(translateError(err));
        extractValidationErrors(err).map(msg => (addWarning(msg)));
    }

    useEffect(() => {
        if (!props.file_id) {
            return;
        }

        getData<FileUploadResponse>(`files/${props.file_id}`).then(r => {
        setFile(r as FileUploadResponse);

        }).catch(err => handleError(err));
    }, [props.file_id]);

    const fileHeader = file ? <Box>{file.file_id} {file.file_name} {file.size} {file.content_type}</Box> : "";
    const fileView = <Box>{fileHeader}</Box>;
    const filePending = <Box>Loading</Box>;

    return (
      <div>
          {file ? fileView : filePending}
      </div>);
};

export const FileViewWrapper: React.FC = () => {
    const {file_id} = useParams();
    return <FileView file_id={file_id} />;
}