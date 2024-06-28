import {IconButton} from '@mui/joy';
import {AxiosError} from "axios";
import {extractValidationErrors, getData, translateError} from "../services/backendCommon.ts";
import {useStatusStore} from "../stores/statusStore.ts";
import {DownloadInfoResponse} from "../types/apiTypes.ts";
import {ReactNode} from "react";

interface DownloadButtonProps {
    file_id: string;
    icon: ReactNode;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({file_id, icon}) => {
    const {addError, addWarning} = useStatusStore();

    const handleError = (err: AxiosError) => {
        addError(translateError(err));
        extractValidationErrors(err).map(msg => (addWarning(msg)));
    }

    const handleDownload = () => {
        getData<DownloadInfoResponse>(`download/info/${file_id}`).then((r) => {
            const link = document.createElement('a');
            link.href = r.url;
            link.setAttribute('download', r.name); // Specify the filename for download
            document.body.appendChild(link);
            link.click();
            link.remove();
        }).catch((err) => {
            handleError(err)
        });
    };

    return (
        <IconButton onClick={handleDownload}>
            {icon}
        </IconButton>
    );
};
