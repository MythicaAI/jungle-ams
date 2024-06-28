import {useAssetVersionStore} from "../stores/assetVersionStore.ts";
import {Box, List, ListItem, Typography} from "@mui/joy";
import {AssetEditFileList} from "./AssetEditFileList.tsx";
import {OpenUploadsState} from "../types/assetEditTypes.ts";
import {AssetEditUploadDrawer} from "./AssetEditUploadDrawer.tsx";
import {useState} from "react";


export const AssetEditListControls = () => {
    const {
        files,
        thumbnails,
        removeFile,
        removeThumbnail,
    } = useAssetVersionStore();

    const [
        openUploads,
        setOpenUploads
    ] = useState<OpenUploadsState>({open: false, opened: false});


    return <Box>
        <AssetEditUploadDrawer
                openUploads={openUploads}
                setOpenUploads={setOpenUploads} />
        <AssetEditFileList
            title={"Files"}
            category={"files"}
            fileTypeFilters={["hda", "hip"]}
            openUploadList={(category, fileTypeFilters) =>
                setOpenUploads({open: true, opened: false, category: category, fileTypeFilters: fileTypeFilters})}
            removeFile={removeFile}
            files={files}/>

        <AssetEditFileList
            title={"Thumbnails"}
            category={"thumbnails"}
            fileTypeFilters={["png", "jpg", "jpeg", "gif", "webm"]}
            openUploadList={(category, fileTypeFilters) =>
                setOpenUploads({open: true, opened: false, category: category, fileTypeFilters: fileTypeFilters})}
            removeFile={removeThumbnail}
            files={thumbnails}/>

        <Box>
            <Typography level="title-md" fontWeight={"bold"}>
                References
            </Typography>
            <List>
                <ListItem key={1}>mythica::palm_fan:1.0</ListItem>
                <ListItem key={2}>mythica::scatter:1.0</ListItem>
            </List>
        </Box>
    </Box>;
}