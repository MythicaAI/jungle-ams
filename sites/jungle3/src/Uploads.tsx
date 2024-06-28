import {
    Divider,
    List,
    ListDivider,
    ListItem,
    ListItemButton,
    ListItemContent,
    ListItemDecorator,
    Stack,
    Typography,
} from '@mui/joy';

import {LucideCloudDownload, LucideFile, LucideFiles, LucideImage,} from 'lucide-react';
import {useEffect, useState} from "react";
import {FileUploadResponse} from "./types/apiTypes.ts";
import {extractValidationErrors, getData, translateError} from "./services/backendCommon.ts";
import {useGlobalStore} from "./stores/globalStore.ts";
import {AxiosError} from "axios";
import {useStatusStore} from "./stores/statusStore.ts";
import {FileUploadStatus, useUploadStore} from "./stores/uploadStore.ts";
import {DownloadButton} from "./components/DownloadButton.tsx";
import {DeleteButton} from "./components/DeleteButton.tsx";
import {UploadsSubmitList} from "./components/UploadsSubmitList.tsx";
import {Link} from "react-router-dom";

const Uploads = () => {
    const {authToken} = useGlobalStore();
    const {addError, addWarning} = useStatusStore();
    const {trackUploads, uploads, updateUpload} = useUploadStore();

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
            if (file.event_ids.length > 0) {
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

    const [sort, setSort] = useState("all");

    interface Sort {
        icon: JSX.Element;
        name: string;
        types: string[];
    }

    const allSorts: { [key: string]: Sort } = {
        all: {icon: <LucideFiles/>, name: "All Files", types: []},
        hdas: {icon: <LucideFile/>, name: "HDAs", types: [".hda", ".hip"]},
        thumbnails: {icon: <LucideImage/>, name: "Thumbnails", types: [".png", ".jpg", ".jpeg", ".gif", ".webm"]},
    }
    const fileTypeFilter = ([_key, value]: [string, FileUploadStatus]): boolean => {
        return fileIsType(sort, value.file_name);
    }

    const fileIsType = (typeName: string, fileName: string): boolean => {
        if (typeName === "all")
            return true;

        const sortType = allSorts[typeName];
        if (!sortType)
            return false;

        const types = sortType.types;
        return types.some((s: string) => fileName.endsWith(s));
    }

    return (
        <>
            <UploadsSubmitList/>
            <List>
                <ListItem sx={{flexGrow: 1}}>
                    <List orientation="horizontal" sx={{flexGrow: 1}}>
                        {Object.entries(allSorts).map(([name, value]) => (
                            <ListItemButton key={name} onClick={() => setSort(name)}>
                                <ListItemDecorator>{value.icon}</ListItemDecorator>
                                <ListItemContent>{value.name}</ListItemContent>
                            </ListItemButton>))}
                    </List>
                </ListItem>
                <ListDivider/>
                {Array.from(Object.entries(uploads)).filter(fileTypeFilter).map(([key, value]) => (
                    <ListItem sx={{flexGrow: 1}} key={key}>
                        <ListItemDecorator sx={{display: 'flex', alignItems: 'center'}}>
                            <Stack direction={"row"}>
                                <DeleteButton
                                    url={`files/${value.file_id}`}
                                    name={value.file_name}
                                    onDeleteSuccess={refreshFiles}/>
                                <DownloadButton
                                    icon={<LucideCloudDownload/>}
                                    file_id={value.file_id}/>
                            </Stack>
                        </ListItemDecorator>
                        <Divider orientation="vertical" sx={{margin: '0 10px'}}/>
                        <ListItemContent sx={{flexGrow: 1, display: 'flex', alignItems: 'center'}}>
                            <Typography
                                sx={{textAlign: 'left'}}>
                                <Link to={`/files/${value.file_id}`}>
                                    {value.file_name}
                                </Link>
                            </Typography>
                        </ListItemContent>
                    </ListItem>
                ))}
            </List>
        </>
    );
};

export default Uploads;
