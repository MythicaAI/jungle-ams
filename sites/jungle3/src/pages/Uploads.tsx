import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  List,
  ListDivider,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Modal,
  ModalClose,
  Select,
  Sheet,
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
import { useTranslation } from "react-i18next";

interface Sort {
  icon: JSX.Element;
  name: string;
  types: string[];
}

const Uploads = () => {
  const [tagModalOpen, setTagModalOpen] = useState<{
    isOpen: boolean;
    selectedFile: FileUploadStatus | null;
  }>({ isOpen: false, selectedFile: null });
  const { addError, addWarning } = useStatusStore();
  const { trackUploads, uploads, updateUpload } = useUploadStore();
  const [deleteModal, setDeleteModal] = useState<{
    selectedFile: string;
    isOpen: boolean;
  }>({ selectedFile: "", isOpen: false });
  const { data: pendingUploads, error } = useGetPendingUploads();
  const { mutate: deleteUpload, error: deleteError } = useDeleteUpload();
  const { t } = useTranslation();

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

  const handleOpenTagModal = (file: FileUploadStatus) => {
    setTagModalOpen({ isOpen: true, selectedFile: file });
  };

  const handleCloseTagModal = () => {
    setTagModalOpen({ isOpen: false, selectedFile: null });
  };

  const [sort, setSort] = useState("all");

  const allSorts: { [key: string]: Sort } = {
    all: { icon: <LucideFiles />, name: t("myUploads.allFiles"), types: [] },
    hdas: { icon: <LucideFile />, name: "HDAs", types: [".hda", ".hip"] },
    thumbnails: {
      icon: <LucideImage />,
      name: t("myUploads.thumbnails"),
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
        <title>Mythica • {t("common.profileMenu.myUploads")}</title>
      </Helmet>
      <Card sx={{ mb: "16px", mx: "16px" }}>
        <Stack>
          <Typography textAlign="start" level="h4">
            {t("myUploads.title")}
          </Typography>
          <Typography textAlign="start">
            {t("myUploads.description")}
          </Typography>
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
                    justifyContent: "space-between",
                  }}
                >
                  <Typography sx={{ textAlign: "left" }} noWrap>
                    <Link to={`/files/${value.file_id}`}>
                      {value.file_name}
                    </Link>
                  </Typography>
                  <Button
                    variant="plain"
                    size="sm"
                    onClick={() => {
                      handleOpenTagModal(value);
                    }}
                  >
                    <Typography>Edit tag</Typography>
                  </Button>
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
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={tagModalOpen.isOpen}
        onClose={handleCloseTagModal}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Sheet
          variant="outlined"
          sx={{
            width: "100%",
            maxWidth: 400,
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
          }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor="inherit"
            sx={{ fontWeight: "lg", mb: 3 }}
          >
            Edit tag
          </Typography>
          <Stack mb="20px" gap="5px">
            <FormControl sx={{ marginBottom: "6px" }}>
              <FormLabel>Select an existing tag</FormLabel>
              <Select
                // disabled={!!item.customTag}
                name="tag"
                // value={item.tag}
                // onChange={(_, newValue) => {
                //   const updatedFiles = updateFileTag(
                //     pendingUploads,
                //     item.id,
                //     (item) => {
                //       return {
                //         ...item,
                //         customTag: "",
                //         tag: newValue as string,
                //       };
                //     },
                //   );
                //   setPendingUploads(updatedFiles);
                // }}
                placeholder="Select a tag"
              >
                {/* {fileTags?.map((tag) => (
                  <Option value={tag.tag_id}>{tag.name}</Option>
                ))} */}
              </Select>
            </FormControl>
            <FormControl sx={{ marginBottom: "6px" }}>
              <FormLabel>Create a custom tag</FormLabel>
              <Input
                name="customFileTag"
                variant="outlined"
                placeholder="Create a new tag"
                // value={item.customTag}
                onChange={(e) => {
                  //   const updatedFiles = updateFileTag(
                  //     pendingUploads,
                  //     item.id,
                  //     (item) => {
                  //       return {
                  //         ...item,
                  //         customTag: e.target.value as string,
                  //         tag: "",
                  //       };
                  //     },
                  //   );
                  //   setPendingUploads(updatedFiles);
                  // }
                }}
              />
            </FormControl>
          </Stack>
          <Stack direction="row" justifyContent="flex-end" gap="8px">
            <Button variant="plain" size="sm" onClick={handleCloseTagModal}>
              Cancel
            </Button>
            <Button variant="solid" size="sm">
              Confirm
            </Button>
          </Stack>
        </Sheet>
      </Modal>
    </>
  );
};

export default Uploads;
