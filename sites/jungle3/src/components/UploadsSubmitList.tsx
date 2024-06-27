import {Button, Card, styled, Table} from "@mui/joy";
import {v4} from "uuid";
import {extractValidationErrors, postData, translateError} from "../services/backendCommon.ts";
import {UploadResponse} from "../types/apiTypes.ts";
import {useStatusStore} from "../stores/statusStore.ts";
import {AxiosError, AxiosProgressEvent, AxiosRequestConfig} from "axios";
import {FileUploadStatus, useUploadStore} from "../stores/uploadStore.ts";
import {UploadButton} from './UploadButton.tsx'
import {LucideUploadCloud} from "lucide-react";

const VisuallyHiddenInput = styled('input')`
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    left: 0;
    white-space: nowrap;
    width: 1px;
`;

export const UploadsSubmitList = function () {
    const {trackUploads, pendingUploads, setUploadProgress, setPendingUploads} = useUploadStore();
    const {setSuccess, addError, addWarning} = useStatusStore();

    const handleError = (err: AxiosError) => {
        addError(translateError(err));
        extractValidationErrors(err).map(msg => (addWarning(msg)));
    }

    const onUploadProgress = (event: AxiosProgressEvent) => {
        console.log("progress:", event.progress);
        if (!event.progress) {
            setUploadProgress(10);
        } else {
            setUploadProgress(event.progress);
        }
    }

    const onUploadFiles = function () {
        if (!pendingUploads) {
            return;
        }

        setUploadProgress(0);

        // create the form data
        const formData = new FormData();
        pendingUploads.forEach(item => {
            formData.append('files', item, item.name);
        });

        // configure axios for uploading
        const config: AxiosRequestConfig = {
            "headers": {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onUploadProgress,
        };

        postData<UploadResponse>("upload/store", formData, config)
            .then(r => {
                const uploads: FileUploadStatus[] = r.files.map((f) => ({
                    ...f,
                    progress: 0,
                }))
                trackUploads(uploads);
                setSuccess(`${uploads.length} uploaded`);
            })
            .catch(err => handleError(err))
            .finally(() => {
                setTimeout(() => {
                    setUploadProgress(100)
                    setTimeout(() => {
                        setPendingUploads([]);
                        setUploadProgress(0);
                    }, 250);
                }, 500)
            });
    };
    const onFileInputChanged = () => {
        const fileList = (document.getElementById("file-input") as HTMLInputElement).files;
        if (!fileList) {
            console.log("no fileList found")
            return;
        }
        setPendingUploads([...pendingUploads, ...fileList]);
    };

    const showPendingUploads = () => !(!pendingUploads || pendingUploads.length == 0);

    return (<Card>
        <Button
                    component="label"
                    role={undefined}
                    tabIndex={-1}
                    variant="plain"
                    color="neutral"
                    startDecorator={<LucideUploadCloud/>}>
                    Upload Files
                    <VisuallyHiddenInput type="file" id="file-input" multiple={true}
                                         onChange={onFileInputChanged}/>
                </Button>
        { showPendingUploads() ? <> <Table aria-label="basic table">
            <thead>
            <tr>
                <th align="left">Pending upload</th>
                <th align="right">Size</th>
            </tr>
            </thead>
            <tbody>
            {
                pendingUploads.map(file => (
                    <tr key={v4()}>
                        <td align="left">
                            {file.name}
                        </td>
                        <td align="right">
                            {file.size}
                        </td>
                    </tr>))
            }
            </tbody>
        </Table>
        <UploadButton onUploadFiles={onUploadFiles} /> </> : "" }
    </Card>);
}