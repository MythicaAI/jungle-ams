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
  Typography,
} from "@mui/joy";
import { FormEvent, useEffect, useState } from "react";
import { FileProgress } from "@components/common/FileProgress";
import { useAssetVersionStore } from "@store/assetVersionStore";
import { FileUploadStatus, useUploadStore } from "@store/uploadStore";
import { LucideCircleCheck } from "lucide-react";
import { AssetVersionContentMap } from "types/apiTypes";
//import { TagCard } from "@components/TagCard";

// const MY_FILES_TAG = {
//   name: "My files",
//   tag_id: "",
//   owner_id: "",
//   created: "",
// };
// const ALL_FILES_TAG = {
//   name: "All files",
//   tag_id: "",
//   owner_id: "",
//   created: "",
// };

interface UploadsReadyListProps {
  category?: string;
  fileTypeFilters: string[];
  isDrawerOpen: boolean;
}
export const UploadsReadyList: React.FC<UploadsReadyListProps> = ({
  category,
  fileTypeFilters = [],
  isDrawerOpen,
}) => {
  // version store keeps the state of the version being authored, upload store keeps the state of the pending
  // uploads that the user has pending
  const {
    files,
    addFile,
    removeFile,
    thumbnails,
    addThumbnail,
    removeThumbnail,
  } = useAssetVersionStore();
  const { uploads } = useUploadStore();
  const [uploadNameFilter, setUploadNameFilter] = useState<string>("");
  const [filteredUploadFiles, setFilteredUploadFiles] = useState<
    FileUploadStatus[]
  >([]);
  // const [selectedTag, setSelectedTag] = useState(MY_FILES_TAG.name);

  useEffect(() => {
    updateFileList(uploadNameFilter);
  }, [uploads]);

  const getAccessors = () => {
    if (category === "files") {
      return { underlyingFiles: files, add: addFile, remove: removeFile };
    } else if (category === "thumbnails") {
      return {
        underlyingFiles: thumbnails,
        add: addThumbnail,
        remove: removeThumbnail,
      };
    }
    return {
      underlyingFiles: {},
      add: (): AssetVersionContentMap => {
        return {};
      },
      remove: (): AssetVersionContentMap => {
        return {};
      },
    };
  };

  // items state represents the referenced list from the asset edit version
  const { underlyingFiles, add, remove } = getAccessors();
  const [items, setItems] = useState<AssetVersionContentMap>(underlyingFiles);

  useEffect(() => {
    setItems(underlyingFiles);
  }, [isDrawerOpen]);

  const onUploadFileNameChanged = (event: FormEvent) => {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    setUploadNameFilter(target.value);
    updateFileList(target.value);
  };

  const onUploadFileNameBlur = () => {};

  const onCheckbox = (file_id: string) => {
    if (file_id in items) {
      // remove an item from the file upload status map
      const newItems = remove(file_id);
      setItems(newItems);
    } else {
      // take an item from the filtered uploads list and move it to the specific
      // mapped file upload status
      const newItems = add(uploads[file_id]);
      setItems(newItems);
    }
  };
  const updateFileList = (filterText: string) => {
    const filteredByInput = filterSelected(filterText, Object.values(uploads));
    const filteredByType = filterByFileTypes(filteredByInput);
    setFilteredUploadFiles(filteredByType);
  };

  const fileIsType = (filters: string[], fileName: string): boolean => {
    return filters.some((s: string) => fileName.endsWith(s));
  };

  const filterSelected = (
    filterText: string,
    files: FileUploadStatus[],
  ): FileUploadStatus[] => {
    if (filterText) {
      const filtered = files.filter((file) =>
        file.file_name.toLowerCase().includes(filterText),
      );
      console.log(
        "filterText:",
        filterText,
        "files:",
        files.length,
        "filtered:",
        filtered.length,
      );
      return filtered;
    }
    console.log("default files");
    return Object.values(files);
  };

  const filterByFileTypes = (files: FileUploadStatus[]): FileUploadStatus[] => {
    if (fileTypeFilters.length > 0) {
      return Object.values(files).filter((fus) =>
        fileIsType(fileTypeFilters, fus.file_name),
      );
    }
    return files;
  };

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
    <ListItem
      sx={{
        fontWeight: "bold",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <ListItemContent sx={{ width: "fit-content", flex: "none" }}>
        <Typography>Name</Typography>
      </ListItemContent>
      <ListItemContent sx={{ width: "fit-content", flex: "none" }}>
        <Typography>Progress</Typography>
      </ListItemContent>
    </ListItem>
  );

  const UploadListItem = (file: FileUploadStatus) => (
    <ListItem>
      <ListItemDecorator sx={{ width: 28 }}>
        <Checkbox
          onChange={() => onCheckbox(file.file_id)}
          checked={file.file_id in items}
        />
      </ListItemDecorator>
      <ListItemDecorator sx={{ width: 28 }}>
        <Box
          component="img"
          src="/houdini.svg"
          alt="Houdini HDA"
          sx={{
            width: "24px",
            height: "24px",
            marginRight: "10px",
            flexShrink: 0,
          }}
        />
      </ListItemDecorator>
      <ListItemContent>{file.file_name}</ListItemContent>
      <ListItemDecorator sx={{ width: 32 }}>
        {file.file_name === "mushroom_from_curve.hda" ? (
          <FileProgress size="sm" value={file.progress ? file.progress : 50} />
        ) : (
          <LucideCircleCheck />
        )}
      </ListItemDecorator>
    </ListItem>
  );

  return (
    <Card>
      <List size="sm">
        <UploadListHeader />
        <ListDivider />
        {/* <Stack direction="row" gap="8px" mt="8px">
          <Box
            onClick={() => {
              setSelectedTag(MY_FILES_TAG.name);
            }}
          >
            <TagCard tag={MY_FILES_TAG} selectedTag={selectedTag} />
          </Box>
          <Box onClick={() => setSelectedTag(ALL_FILES_TAG.name)}>
            <TagCard tag={ALL_FILES_TAG} selectedTag={selectedTag} />
          </Box>
        </Stack> */}
        <Input
          name="file-name"
          value={uploadNameFilter}
          variant="outlined"
          placeholder="Filter..."
          onChange={onUploadFileNameChanged}
          onBlur={onUploadFileNameBlur}
          sx={{ marginBottom: "16px", my: 2 }}
        />
        {filteredUploadFiles.map((file, index) => (
          <UploadListItem key={index} {...file} />
        ))}
        {/*    </tbody>*/}
        {/*</Table></Card>*/}
      </List>
    </Card>
  );
};
