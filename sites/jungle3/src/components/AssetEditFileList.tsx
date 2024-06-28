import {
    FormControl,
    FormLabel,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemDecorator,
    Sheet,
    Textarea, Typography
} from "@mui/joy";
import {
    LucideCircleMinus,
    LucideDoorClosed,
    LucideEdit,
    LucideLink,
    LucidePlusCircle,
    LucideSave
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {AssetVersionContent, AssetVersionContentMap} from "../types/apiTypes.ts";


interface AssetEditFileListProps {
    title: string,
    category: string,
    fileTypeFilters: string[],
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
                    <Textarea
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        placeholder="Enter File Name..."
                        minRows={1}
                        maxRows={3}
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

const handleEditSave = () => {
}
const handleEditCancel = () => {
}


export const AssetEditFileList: React.FC<AssetEditFileListProps> = (props) => {
    const navigate = useNavigate();

    return <FormControl>
        <FormLabel>
            <IconButton onClick={(e) => {
                e.preventDefault();
                props.openUploadList(props.category, props.fileTypeFilters)
            }}>
                <LucidePlusCircle />
            </IconButton>
            <Typography variant="soft" level="title-md" fontWeight={"bold"}>
                {props.title}
            </Typography>
        </FormLabel>
        <Sheet key={props.category} variant="outlined" sx={{borderRadius: 'sm'}}>
            <List id={props.category} size={"sm"}>
                {Object.values(props.files).map(file => (
                    <ListItem key={file.file_id}>
                        <ListItemDecorator>
                            <IconButton
                                onClick={() => props.removeFile(file.file_id)}>
                                <LucideCircleMinus/>
                            </IconButton>
                        </ListItemDecorator>
                        <ListItemButton role="menuitem">
                            <AssetFileEditable
                                content={file}
                                editing={false}
                                save={() => handleEditSave()}
                                cancel={() => handleEditCancel()}/>
                        </ListItemButton>
                        <ListItemDecorator>
                            <IconButton onClick={() => navigate(`/files/${file.file_id}`)}>
                                <LucideLink/>
                            </IconButton>
                        </ListItemDecorator>
                    </ListItem>))}
            </List>
        </Sheet>
    </FormControl>
        ;
}