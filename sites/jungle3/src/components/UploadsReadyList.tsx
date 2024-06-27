import {
    Box,
    Card,
    Checkbox,
    Input,
    List,
    ListDivider,
    ListItem,
    ListItemContent,
    ListItemDecorator,
    Typography
} from "@mui/joy";
import {FormEvent, useEffect, useState} from "react";
import {FileProgress} from "./FileProgress.tsx";
import {useAssetVersionStore} from "../stores/assetVersionStore.ts";
import {FileUploadStatus, useUploadStore} from "../stores/uploadStore.ts";
import {LucideCircleCheck} from "lucide-react";

export const UploadsReadyList = () => {
    // version store keeps the state of the version being authored, upload store keeps the state of the pending
    // uploads that the user has pending
    const {files, addFile, removeFile} = useAssetVersionStore();
    const {uploads} = useUploadStore();
    const [uploadNameFilter, setUploadNameFilter] = useState<string>("");
    const [filteredUploadFiles, setFilteredUploadFiles] = useState<FileUploadStatus[]>([]);

    useEffect(() => setFilteredUploadFiles(Object.values(uploads)), [uploads]);

    const onUploadFileNameChanged = (event: FormEvent) => {
        event.preventDefault();
        const target = event.target as HTMLInputElement;
        setUploadNameFilter(target.value);
        setFilteredUploadFiles(filterSelected(target.value, Object.values(uploads)));
    }

    const onUploadFileNameBlur = () => {
    }

    const onFileCheckbox = (file_id: string) => {
        if (file_id in files) {
            removeFile(file_id)
        } else {
            addFile(uploads[file_id]);
        }
    }

    const filterSelected = (filterText: string, files: FileUploadStatus[]): FileUploadStatus[] => {
        if (filterText) {
            const filtered = files.filter(
                (file) => file.file_name.toLowerCase().includes(filterText));
            console.log("filterText:", filterText, "files:", files.length, "filtered:", filtered.length);
            return filtered;
        }
        console.log("default files");
        return Object.values(files);
    }

    // const updateProgressForFiles = (files: FileUploadResponse[]) => {
    //     files.forEach(file => {
    //         if(file.event_ids.length > 0) {
    //             updateUpload(file.file_id, 50);
    //         } else {
    //             updateUpload(file.file_id, 100);
    //         }
    //     })
    // }

    const UploadListHeader = () => (
        <ListItem sx={{fontWeight: 'bold'}}>
            <ListItemDecorator sx={{width: 32}}></ListItemDecorator>
            <ListItemDecorator sx={{width: 32}}></ListItemDecorator>
            <ListItemContent><Typography sx={{flex: 1}}>Name</Typography></ListItemContent>
            <ListItemDecorator sx={{width: 32}}>Progress</ListItemDecorator>
        </ListItem>
    );

    const UploadListItem = (file: FileUploadStatus) => (
        <ListItem>
            <ListItemDecorator sx={{width: 28}}>
                <Checkbox onChange={() => onFileCheckbox(file.file_id)}
                          checked={file.file_id in files}/>
            </ListItemDecorator>
            <ListItemDecorator sx={{width: 28}}>
                <Box component="img"
                     src="/houdini.svg"
                     alt="Houdini HDA"
                     sx={{width: '24px', height: '24px', marginRight: '10px', flexShrink: 0}}/>
            </ListItemDecorator>
            <ListItemContent>{file.file_name}</ListItemContent>
            <ListItemDecorator sx={{width: 32}}>
                {file.file_name === "mushroom_from_curve.hda" ?
                    <FileProgress size="sm" value={file.progress ? file.progress : 50}/>
                    : <LucideCircleCheck/>}
            </ListItemDecorator>
        </ListItem>
    );

    return <Card>
        <List size="sm">
            <UploadListHeader/>
            <ListDivider/>
            <Input
                name="file-name"
                value={uploadNameFilter}
                variant="outlined"
                placeholder="Filter..."
                onChange={onUploadFileNameChanged}
                onBlur={onUploadFileNameBlur}
                sx={{marginBottom: '16px', my: 2}}/>
            {filteredUploadFiles.map((file, index) => (
                <UploadListItem key={index} {...file} />
            ))}
            {/*    </tbody>*/}
            {/*</Table></Card>*/}
        </List>
    </Card>
        ;
}
