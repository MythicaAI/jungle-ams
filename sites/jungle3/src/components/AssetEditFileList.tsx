import {
    Box,
    Sheet,
    FormControl,
    FormLabel,
    IconButton,
    List,
    ListItem,
    ListItemDecorator,
    ListItemContent, ListItemButton, TextField
} from "@mui/joy";
import {
    LucideCircleMinus,
    LucideDoorClosed,
    LucideEdit,
    LucideEllipsis,
    LucideExternalLink,
    LucideLink,
    LucideSave
} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {AssetVersionContent, AssetVersionContentMap} from "../types/apiTypes.ts";
import {FileUploadStatus} from "../stores/uploadStore.ts";


interface AssetEditFileListProps {
    title: string,
    category: string,
    fileFilters: string[],
    openUploadList: (category: string, fileFilters: string[]) => void;
    removeFile: (file_id: string) => void;
    files: AssetVersionContentMap
}

interface AssetFileEditableProps {
    content: AssetVersionContent;
    editing: boolean;
    save: (path: string) => void;
    cancel: () => void;
}

const AssetFileEditable: React.FC<AssetFileEditableProps> = (props: AssetFileEditableProps) => {
    const [path, setPath] = useState(props.content.file_name);
    const initialPath = props.content.file_name;


    const handleCancel = () => {
        // revert to initial path, stop editing
        props.save(initialPath);
        props.editing = false;
    };

    const handleSave = () => {
        props.save(path);
        props.editing = false;
    }

    return (
        <React.Fragment>
            {props.editing ? (
                <>
                    <TextField
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        fullWidth
                    />
                    <IconButton onClick={handleSave}><LucideSave/></IconButton>
                    <IconButton onClick={handleCancel}><LucideDoorClosed/></IconButton>
                </>
            ) : (
                <React.Fragment>
                    <LucideEdit/>
                    {path} ({props.content.file_id})
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export const AssetEditFileList: React.FC<AssetEditFileListProps> = (props) => {
    const navigate = useNavigate();

    return <FormControl>
        <FormLabel>
            {props.title}
            <IconButton onClick={() => props.openUploadList(props.category, props.fileFilters)}>
                <LucideEllipsis/>
            </IconButton>
        </FormLabel>
         <Sheet key={props.category} variant="outlined" sx={{ borderRadius: 'sm' }}>
            <List id={props.category} size={"sm"}>
                {Object.values(props.files).map(file => (
                    <ListItem key={file.file_id} >
                        <ListItemDecorator>
                            <IconButton
                                onClick={() => props.removeFile(file.file_id)}>
                                <LucideCircleMinus/>
                            </IconButton>
                        </ListItemDecorator>
                        <ListItemButton role="menuitem">
                            <AssetFileEditable content={file}/>
                        </ListItemButton>
                        <ListItemDecorator>
                            <IconButton onClick={() => navigate(`/files/${file.file_id}`)}>
                                <LucideLink />
                            </IconButton>
                        </ListItemDecorator>
                    </ListItem>))}
            </List>
         </Sheet>
    </FormControl>
        ;
}