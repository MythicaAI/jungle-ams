import {
  FormControl,
  FormLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  Sheet,
  Textarea,
  Typography,
} from "@mui/joy";
import {
  LucideCircleMinus,
  LucideEdit,
  LucideLink,
  LucidePlusCircle,
  LucideSave,
  LucideX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { AssetVersionContent, AssetVersionContentMap } from "types/apiTypes.ts";
import { useAssetVersionStore } from "@store/assetVersionStore";

interface AssetEditFileListProps {
  title: string;
  category: string;
  fileTypeFilters: string[];
  openUploadList: (category: string, fileFilters: string[]) => void;
  removeFile: (file_id: string) => void;
  files: AssetVersionContentMap;
}

interface AssetFileEditableProps {
  content: AssetVersionContent;
  editing: boolean;
  setEditing: (value: {
    isEditing: boolean;
    file: AssetVersionContent;
  }) => void;
  save: (
    oldFile: AssetVersionContent,
    updatedFile: AssetVersionContent,
  ) => void;
  cancel: () => void;
}

const AssetFileEditable: React.FC<AssetFileEditableProps> = (
  props: AssetFileEditableProps,
) => {
  const [path, setPath] = useState(props.content.file_name);

  const handleCancel = () => {
    props.cancel();
  };

  const handleSave = () => {
    const oldFile = props.content;
    const newFile = { ...props.content, file_name: path };
    props.save(oldFile, newFile);
  };

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
            sx={{ width: "70%" }}
          />
          <IconButton onClick={handleSave}>
            <LucideSave />
          </IconButton>
          <IconButton onClick={handleCancel}>
            <LucideX />
          </IconButton>
        </>
      ) : (
        <React.Fragment>
          <LucideEdit
            onClick={() =>
              props.setEditing({ isEditing: true, file: props.content })
            }
          />
          {path} ({props.content.file_id})
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export const AssetEditFileList: React.FC<AssetEditFileListProps> = (props) => {
  const navigate = useNavigate();
  const [editing, setEditing] = React.useState<{
    isEditing: boolean;
    file: AssetVersionContent | null;
  }>({ isEditing: false, file: null });
  const { removeFile, addFile } = useAssetVersionStore();

  const handleEditSave = (
    oldFile: AssetVersionContent,
    updatedFile: AssetVersionContent,
  ) => {
    removeFile(oldFile.file_id);
    addFile(updatedFile);
    setEditing({ isEditing: false, file: null });
  };
  const handleEditCancel = () => {
    setEditing({ isEditing: false, file: null });
  };

  return (
    <FormControl>
      <FormLabel>
        <IconButton
          onClick={(e) => {
            e.preventDefault();
            props.openUploadList(props.category, props.fileTypeFilters);
          }}
          data-testid="add-btn"
        >
          <LucidePlusCircle />
        </IconButton>
        <Typography variant="soft" level="title-md" fontWeight={"bold"}>
          {props.title}
        </Typography>
      </FormLabel>
      <Sheet
        key={props.category}
        variant="outlined"
        sx={{ borderRadius: "sm" }}
      >
        <List id={props.category} size={"sm"}>
          {Object.values(props.files).length > 0 ? (
            Object.values(props.files).map((file) => (
              <ListItem key={file.file_id}>
                <ListItemDecorator>
                  <IconButton
                    onClick={() => props.removeFile(file.file_id)}
                    data-testid={`remove-button-${file.file_id}`}
                  >
                    <LucideCircleMinus />
                  </IconButton>
                </ListItemDecorator>
                <ListItemButton role="menuitem" data-testid="assetFileEditable">
                  <AssetFileEditable
                    content={file}
                    editing={editing.file?.file_id === file.file_id}
                    setEditing={setEditing}
                    save={handleEditSave}
                    cancel={() => handleEditCancel()}
                  />
                </ListItemButton>
                <ListItemDecorator>
                  <IconButton
                    onClick={() => navigate(`/files/${file.file_id}`)}
                  >
                    <LucideLink />
                  </IconButton>
                </ListItemDecorator>
              </ListItem>
            ))
          ) : (
            <ListItem>No {props.category} selected</ListItem>
          )}
        </List>
      </Sheet>
    </FormControl>
  );
};
