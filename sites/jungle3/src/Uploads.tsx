import {
    Button,
    Grid, styled,
} from '@mui/joy';

import {LucidePlusCircle, LucideUploadCloud} from 'lucide-react';
import React, {useEffect} from "react";
import {AssetCreateRequest, AssetCreateResponse, FileUploadResponse} from "./types/apiTypes.ts";
import {extractValidationErrors, getData, postData, translateError} from "./services/backendCommon.ts";
import {useGlobalStore} from "./stores/globalStore.ts";
import {AssetEdit} from "./AssetEdit.tsx";
import {AxiosError} from "axios";
import {StatusStack} from "./components/StatusStack.tsx";
import {UploadsSubmitList} from "./components/UploadsSubmitList.tsx";
import {UploadsReadyList} from "./components/UploadsReadyList.tsx";
import {useStatusStore} from "./stores/statusStore.ts";
import {FileUploadStatus, useUploadStore} from "./stores/uploadStore.ts";
import {useAssetVersionStore} from "./stores/assetVersionStore.ts";

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
    const {trackUploads, updateUpload, setPendingUploads, pendingUploads} = useUploadStore();

    const handleError = (err: AxiosError) => {
        addError(translateError(err));
        extractValidationErrors(err).map(msg => (addWarning(msg)));
    }

    //
    // Load the latest pending uploads from the server
    //
    useEffect(() => {
        if (authToken) {
            console.log("loading pending uploads")
            getData<FileUploadResponse[]>("upload/pending").then(files => {
                trackUploads(files as FileUploadStatus[]);
                updateProgressForFiles(files);
            }).catch(err => handleError(err));
        }
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

    const createAsset = function() {
        if (!asset_id || asset_id === "") {
            const createRequest: AssetCreateRequest = {};
            postData<AssetCreateResponse>('assets/', createRequest).then(r => {
                updateVersion({
                    asset_id: r.id,
                    org_id: r.org_id,
                })
            }).catch(err => handleError(err));
        }
    }

    const onFileInputChanged = function (_event: React.ChangeEvent<HTMLInputElement>) {
        const fileList = (document.getElementById("file-input") as HTMLInputElement).files;
        if (!fileList) {
            console.log("no fileList found")
            return;
        }
        setPendingUploads([...pendingUploads, ...fileList]);
    };

    return (
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid xs={12}>
                <Button
                    component="label"
                    variant={"plain"}
                    color={"neutral"}
                    onMouseDown={createAsset}
                    startDecorator={<LucidePlusCircle/>}>
                    New Asset
                </Button>
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
            </Grid>
            {asset_id ? <Grid xs={6}><AssetEdit/></Grid> : ""}
            <Grid xs={6}>
                {<UploadsSubmitList />}
                {<UploadsReadyList/>}

            </Grid>
        </Grid>
    );
};

export default Uploads;
