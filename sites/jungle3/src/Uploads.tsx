import {
    Button, Divider,
    Grid, IconButton, List, ListItem, ListItemButton, ListItemContent, ListItemDecorator, Stack, styled, Typography,
} from '@mui/joy';

import {
    LucideDownloadCloud,
    LucideFile,
    LucideImage,
    LucidePlusCircle,
    LucideTrash,
    LucideUploadCloud
} from 'lucide-react';
import {useEffect} from "react";
import {AssetCreateRequest, AssetCreateResponse, FileUploadResponse} from "./types/apiTypes.ts";
import {extractValidationErrors, getData, postData, translateError} from "./services/backendCommon.ts";
import {useGlobalStore} from "./stores/globalStore.ts";
import {AssetEdit} from "./AssetEdit.tsx";
import {AxiosError} from "axios";
import {UploadsSubmitList} from "./components/UploadsSubmitList.tsx";
import {UploadsReadyList} from "./components/UploadsReadyList.tsx";
import {useStatusStore} from "./stores/statusStore.ts";
import {FileUploadStatus, useUploadStore} from "./stores/uploadStore.ts";
import {useAssetVersionStore} from "./stores/assetVersionStore.ts";
import {useNavigate} from "react-router-dom";
import {DownloadButton} from "./components/DownloadButton.tsx";
import {DeleteButton} from "./components/DeleteButton.tsx";

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

const Uploads = () => {
    const {authToken} = useGlobalStore();
    const {asset_id, updateVersion} = useAssetVersionStore();
    const {addError, addWarning} = useStatusStore();
    const {trackUploads, uploads, updateUpload, setPendingUploads} = useUploadStore();
    const navigate = useNavigate();

    const handleError = (err: AxiosError) => {
        addError(translateError(err));
        extractValidationErrors(err).map(msg => (addWarning(msg)));
    }

    //
    // Load the latest pending uploads from the server
    //
    useEffect(() => {
        refreshFiles();
    }, [authToken])

    const updateProgressForFiles = (files: FileUploadResponse[]) => {
        files.forEach(file => {
            if(file.event_ids.length > 0) {
                updateUpload(file.file_id, 50);
            } else {
                updateUpload(file.file_id, 100);
            }
        })
    }

    const refreshFiles = () => {
        if (authToken) {
            getData<FileUploadResponse[]>("upload/pending").then(files => {
                trackUploads(files as FileUploadStatus[]);
                updateProgressForFiles(files);
            }).catch(err => handleError(err));
        }
    }

    return (
        <List>
            <ListItem sx={{flexGrow: 1}}>
                <List orientation="horizontal" sx={{flexGrow: 1}}>
                    <ListItemButton>
                        <ListItemDecorator><LucideFile /></ListItemDecorator>
                        <ListItemContent>HDAs</ListItemContent>
                    </ListItemButton>
                    <ListItemButton>
                        <ListItemDecorator><LucideImage /></ListItemDecorator>
                        <ListItemContent>Thumbnails</ListItemContent>
                    </ListItemButton>
                </List>
            </ListItem>
            { Array.from(Object.entries(uploads)).map(([key, value]) => (
                <ListItem sx={{flexGrow: 1}} key={key}>
                    <ListItemDecorator sx={{ display: 'flex', alignItems: 'center' }}>
                        <Stack direction={"row"}>
                            <DeleteButton
                                url={`files/${value.file_id}`}
                                name={value.file_name}
                                onDeleteSuccess={refreshFiles}/>
                            <DownloadButton
                                file_id={value.file_id} />
                        </Stack>
                    </ListItemDecorator>
                    <Divider orientation="vertical" sx={{ margin: '0 10px' }} />
                    <ListItemContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography  sx={{ textAlign: 'left' }}>{value.file_name}</Typography>
                    </ListItemContent>
                </ListItem>
            ))}
        </List>
    );
};

export default Uploads;
