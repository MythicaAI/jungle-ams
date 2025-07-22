import {useAssetVersionStore} from "@store/assetVersionStore";
import {Box} from "@mui/joy";
import {AssetEditFileList} from "./AssetEditFileList";
import {OpenUploadsState} from "types/assetEditTypes";
import {AssetEditUploadDrawer} from "./AssetEditUploadDrawer";
import {useState} from "react";
import {AssetEditThumbnails} from "./AssetEditThumbnails";

type Props = {
  category: "files" | "thumbnails";
};

export const AssetEditListControls: React.FC<Props> = ({category}) => {
  const {files, thumbnails, removeFile, removeThumbnail} =
    useAssetVersionStore();

  const [openUploads, setOpenUploads] = useState<OpenUploadsState>({
    open: false,
    opened: false,
  });

  return (
    <Box>
      <AssetEditUploadDrawer
        openUploads={openUploads}
        setOpenUploads={setOpenUploads}
      />
      {category === "files" && (
        <AssetEditFileList
          title={"Files"}
          category={"files"}
          fileTypeFilters={[]}
          openUploadList={(category, fileTypeFilters) =>
            setOpenUploads({
              open: true,
              opened: false,
              category: category,
              fileTypeFilters: fileTypeFilters,
            })
          }
          removeFile={removeFile}
          files={files}
        />
      )}

      {category === "thumbnails" && (
        <AssetEditThumbnails
          title={"Thumbnails"}
          category={"thumbnails"}
          fileTypeFilters={["png", "jpg", "jpeg", "gif", "webm"]}
          openUploadList={(category, fileTypeFilters) =>
            setOpenUploads({
              open: true,
              opened: false,
              category: category,
              fileTypeFilters: fileTypeFilters,
            })
          }
          removeFile={removeThumbnail}
          files={thumbnails}
        />
      )}
    </Box>
  );
};
