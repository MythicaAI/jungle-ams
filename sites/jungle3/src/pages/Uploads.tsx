import {
  Box,
  Card,
  Divider,
  IconButton,
  List,
  ListDivider,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Stack,
  Typography,
} from "@mui/joy";

import {
  LucideCloudDownload,
  LucideFile,
  LucideFiles,
  LucideImage,
  LucideTrash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FileUploadResponse } from "types/apiTypes";
import {
  extractValidationErrors,
  translateError,
} from "@services/backendCommon";
import { Helmet } from "react-helmet-async";
import { useStatusStore } from "@store/statusStore";
import { FileUploadStatus, useUploadStore } from "@store/uploadStore";
import { DownloadButton } from "@components/common/DownloadButton";
import { UploadsSubmitList } from "@components/Uploads/UploadsSubmitList";
import { Link } from "react-router-dom";
import { useDeleteUpload, useGetPendingUploads } from "@queries/uploads";
import { DeleteModal } from "@components/common/DeleteModal";

const Uploads = () => {
  const { addError, addWarning } = useStatusStore();
  const { trackUploads, uploads, updateUpload } = useUploadStore();
  const [deleteModal, setDeleteModal] = useState<{
    selectedFile: string;
    isOpen: boolean;
  }>({ selectedFile: "", isOpen: false });
  const { data: pendingUploads, error } = useGetPendingUploads();
  const { mutate: deleteUpload, error: deleteError } = useDeleteUpload();

  const handleError = (err: any) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  const handleDeleteCleaup = () => {
    setDeleteModal({ isOpen: false, selectedFile: "" });
  };

  //
  // Load the latest pending uploads from the server
  //
  useEffect(() => {
    if (pendingUploads) {
      refreshFiles(pendingUploads);
    }
  }, [pendingUploads]);

  useEffect(() => {
    if (error) {
      handleError(error);
    }
    if (deleteError) {
      handleError(deleteError);
    }
  }, [error, deleteError]);

  const updateProgressForFiles = (files: FileUploadResponse[]) => {
    files.forEach((file) => {
      if (file.event_ids.length > 0) {
        updateUpload(file.file_id, 50);
      } else {
        updateUpload(file.file_id, 100);
      }
    });
  };

  const refreshFiles = (files: FileUploadResponse[]) => {
    trackUploads(files as FileUploadStatus[]);
    updateProgressForFiles(files);
  };

  const [sort, setSort] = useState("all");

  interface Sort {
    icon: JSX.Element;
    name: string;
    types: string[];
  }

  const allSorts: { [key: string]: Sort } = {
    all: { icon: <LucideFiles />, name: "All Files", types: [] },
    hdas: { icon: <LucideFile />, name: "HDAs", types: [".hda", ".hip"] },
    thumbnails: {
      icon: <LucideImage />,
      name: "Thumbnails",
      types: [".png", ".jpg", ".jpeg", ".gif", ".webm"],
    },
  };
  const fileTypeFilter = ([_key, value]: [
    string,
    FileUploadStatus,
  ]): boolean => {
    return fileIsType(sort, value.file_name);
  };

  const fileIsType = (typeName: string, fileName: string): boolean => {
    if (typeName === "all") return true;

    const sortType = allSorts[typeName];
    if (!sortType) return false;

    const types = sortType.types;
    return types.some((s: string) => fileName.endsWith(s));
  };

  return (
    <>
      <Helmet>
        <title>Mythica • My Uploads</title>
      </Helmet>
      <Card sx={{ mb: "16px", mx: "16px" }}>
        <Stack>
          <Typography textAlign="start" level="h4">
            Your uploads
          </Typography>
          <Typography textAlign="start">Manage your uploaded files</Typography>
        </Stack>
      </Card>
      <Box mx="16px">
        <UploadsSubmitList />
        <List>
          <ListItem sx={{ flexGrow: 1 }}>
            <List orientation="horizontal" sx={{ flexGrow: 1 }}>
              {Object.entries(allSorts).map(([name, value]) => (
                <ListItemButton key={name} onClick={() => setSort(name)}>
                  <ListItemDecorator>{value.icon}</ListItemDecorator>
                  <ListItemContent>{value.name}</ListItemContent>
                </ListItemButton>
              ))}
            </List>
          </ListItem>
          <ListDivider />
          {Array.from(Object.entries(uploads))
            .filter(fileTypeFilter)
            .map(([key, value]) => (
              <ListItem sx={{ flexGrow: 1 }} key={key}>
                <ListItemDecorator
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Stack direction={"row"} minWidth="72px">
                    <IconButton
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          selectedFile: value.file_id,
                        })
                      }
                    >
                      <LucideTrash />
                    </IconButton>
                    <DownloadButton
                      icon={<LucideCloudDownload />}
                      file_id={value.file_id}
                    />
                  </Stack>
                </ListItemDecorator>
                <Divider orientation="vertical" sx={{ margin: "0 10px" }} />
                <ListItemContent
                  sx={{
                    width: "calc(100% - 82px)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ textAlign: "left" }} noWrap>
                    <Link to={`/files/${value.file_id}`}>
                      {value.file_name}
                    </Link>
                  </Typography>
                </ListItemContent>
              </ListItem>
            ))}
        </List>
      </Box>
      <DeleteModal
        open={deleteModal.isOpen}
        handleClose={handleDeleteCleaup}
        handleConfirm={() => {
          deleteUpload(deleteModal.selectedFile, {
            onSettled: () => handleDeleteCleaup(),
          });
        }}
      />
    </>
  );
};

export default Uploads;
