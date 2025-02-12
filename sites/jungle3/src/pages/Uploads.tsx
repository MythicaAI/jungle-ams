import {
  Box,
  Button,
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
import { useTranslation } from "react-i18next";
import {
  useAssignTagToFile,
  useCreateFileTag,
  useGetAllTags,
  useRemoveTagFromFile,
} from "@queries/tags";
import { useGlobalStore } from "@store/globalStore";
import { TAGS_ROLE } from "@components/AssetEdit/AssetEditDetailControls";
import { FileTagModal } from "@components/common/FileTagModal";

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
  const [tagModalInputs, setTagModalInputs] = useState<{
    dropdownTag: string | null;
    customTag: string | null;
  }>({ dropdownTag: null, customTag: null });
  const { setSuccess, addError, addWarning } = useStatusStore();
  const { orgRoles } = useGlobalStore();
  const { trackUploads, uploads, updateUpload } = useUploadStore();
  const [deleteModal, setDeleteModal] = useState<{
    selectedFile: string;
    isOpen: boolean;
  }>({ selectedFile: "", isOpen: false });
  const { data: pendingUploads, error } = useGetPendingUploads();
  const { mutate: deleteUpload, error: deleteError } = useDeleteUpload();
  const { t } = useTranslation();
  const { data: allTags } = useGetAllTags();

  const { mutate: removeTagFromFile } = useRemoveTagFromFile();
  const { mutate: assignTagToFile } = useAssignTagToFile();
  const { mutate: createFileTag } = useCreateFileTag();
  const hasTagsRole =
    orgRoles && orgRoles.some((entry) => entry.role === TAGS_ROLE);

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
    setTagModalInputs({ dropdownTag: null, customTag: null });
  };

  const handleUpdateTag = () => {
    const customTag = tagModalInputs.customTag;
    const dropdownTag = tagModalInputs.dropdownTag;
    if (!tagModalOpen) return;

    if (
      tagModalOpen?.selectedFile?.tags &&
      tagModalOpen?.selectedFile?.tags.length > 0
    ) {
      const prevTag = tagModalOpen.selectedFile.tags[0];

      const isDifferent =
        (customTag && prevTag.name !== customTag) ||
        (dropdownTag && prevTag.tag_id !== dropdownTag);
      if (!isDifferent) return;

      return removeTagFromFile(
        {
          type_id: tagModalOpen?.selectedFile?.file_id as string,
          tag_id: prevTag.tag_id,
        },
        {
          onSuccess: () => {
            if (dropdownTag && !customTag) {
              return assignTagToFile(
                {
                  tag_id: dropdownTag,
                  type_id: tagModalOpen.selectedFile?.file_id as string,
                },
                {
                  onSuccess: () => {
                    setSuccess("Tag updated");
                  },
                  onError: (err) => {
                    handleError(err);
                  },
                },
              );
            }

            if (customTag && !dropdownTag) {
              return createFileTag(customTag, {
                onSuccess: (res) => {
                  assignTagToFile(
                    {
                      tag_id: res.tag_id,
                      type_id: tagModalOpen.selectedFile?.file_id as string,
                    },
                    {
                      onSuccess: () => {
                        setSuccess("Tag updated");
                      },
                      onError: (err) => {
                        handleError(err);
                      },
                    },
                  );
                },
                onError: (err) => {
                  handleError(err);
                },
              });
            }
          },
          onError: (err) => {
            handleError(err);
          },
        },
      );
    }

    if (dropdownTag && !customTag) {
      return assignTagToFile(
        {
          tag_id: dropdownTag,
          type_id: tagModalOpen.selectedFile?.file_id as string,
        },
        {
          onSuccess: () => {
            setSuccess("Tag updated");
          },
          onError: (err) => {
            handleError(err);
          },
        },
      );
    }

    if (customTag && !dropdownTag) {
      return createFileTag(customTag, {
        onSuccess: (res) => {
          assignTagToFile(
            {
              tag_id: res.tag_id,
              type_id: tagModalOpen.selectedFile?.file_id as string,
            },
            {
              onSuccess: () => {
                setSuccess("Tag updated");
              },
              onError: (err) => {
                handleError(err);
              },
            },
          );
        },
        onError: (err) => {
          handleError(err);
        },
      });
    }
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
                  <Stack direction="row" alignItems="center" gap="8px">
                    {value.tags && value.tags.length > 0 && (
                      <Button disabled variant="outlined">
                        {value.tags[0].name}
                      </Button>
                    )}
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => {
                        handleOpenTagModal(value);
                      }}
                    >
                      <Typography>Edit tag</Typography>
                    </Button>
                  </Stack>
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
      <FileTagModal
        tagModalOpen={tagModalOpen}
        tagModalInputs={tagModalInputs}
        setTagModalInputs={setTagModalInputs}
        handleUpdateTag={handleUpdateTag}
        allTags={allTags}
        hasTagsRole={!!hasTagsRole}
        handleCloseModal={handleCloseTagModal}
      />
    </>
  );
};

export default Uploads;
