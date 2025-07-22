import {
  Box,
  Button,
  Card,
  Checkbox,
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
  Input,
} from "@mui/joy";

import {
  LucideCloudDownload,
  LucideFile,
  LucideFiles,
  LucideImage,
  LucidePlus,
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
import { Link, useNavigate } from "react-router-dom";
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
import { useCreateAsset } from "@queries/packages";

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
  const { data: pendingUploads, error, refetch } = useGetPendingUploads();
  const { mutate: deleteUpload, error: deleteError } = useDeleteUpload();
  const { t } = useTranslation();
  const { data: allTags } = useGetAllTags();
  const { mutate: createAsset } = useCreateAsset();
  const navigate = useNavigate();

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
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filterText, setFilterText] = useState("");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  const filteredUploads = Object.entries(uploads).filter(([_, value]) =>
    value.file_name.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId],
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredUploads.map(([_key, value]) => value.file_id));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    const allFilteredFileIds = filteredUploads.map(([_key, value]) => value.file_id);
    setSelectAll(
      allFilteredFileIds.length > 0 &&
      allFilteredFileIds.every((id) => selectedFiles.includes(id))
    );
  }, [filteredUploads, selectedFiles]);

  const handleDeleteSelected = () => {
    const deletePromises = selectedFiles.map((fileId) =>
      new Promise((resolve) => {
        deleteUpload(fileId, {
          onSettled: () => {
            setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
            resolve(null);
          },
        });
      })
    );

    Promise.all(deletePromises).then(() => {
      refetch(); // Refresh pendingUploads after bulk deletion
    });
  };

  const handleDeleteSingle = (fileId: string) => {
    deleteUpload(fileId, {
      onSettled: () => {
        refetch(); // Refresh pendingUploads after single deletion
      },
    });
  };

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
            <Checkbox
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <Button
              variant="solid"
              color="danger"
              onClick={handleDeleteSelected}
              disabled={selectedFiles.length === 0}
              sx={{ marginRight: "16px" }}
            >
              Delete Selected
            </Button>
            <List orientation="horizontal" sx={{ flexGrow: 1 }}>
              {Object.entries(allSorts).map(([name, value]) => (
                <ListItemButton key={name} onClick={() => setSort(name)}>
                  <ListItemDecorator>{value.icon}</ListItemDecorator>
                  <ListItemContent>{value.name}</ListItemContent>
                </ListItemButton>
              ))}
            </List>
            <Input
                placeholder="Filter files..."
                value={filterText}
                onChange={handleFilterChange}
                sx={{ flexGrow: 3}}
              />
          </ListItem>
          <ListDivider />
          {filteredUploads
            .filter(fileTypeFilter)
            .map(([key, value]) => (
              <ListItem sx={{ flexGrow: 1 }} key={key}>
                <Checkbox
                  checked={selectedFiles.includes(value.file_id)}
                  onChange={() => handleSelectFile(value.file_id)}
                  sx={{ marginRight: "16px" }}
                />
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
                      <Button disabled variant="outlined" size="sm">
                        {value.tags[0].name}
                      </Button>
                    )}
                    {(value.content_type === "application/hda" ||
                      value.content_type === "application/blend") && (
                      <Button
                        size="sm"
                        variant="plain"
                        onClick={() => {
                          createAsset(
                            {},
                            {
                              onSuccess: (res) => {
                                const fileData = {
                                  content_hash: value.content_hash,
                                  size: value.size,
                                  file_name: value.file_name,
                                  file_id: value.file_id,
                                };
                                localStorage.setItem(
                                  "assetFromHdaPayload",
                                  JSON.stringify(fileData),
                                );
                                navigate(
                                  `/assets/${res.asset_id}/versions/1.0.0`,
                                );
                              },
                            },
                          );
                        }}
                      >
                        Create package{" "}
                        <LucidePlus
                          width="16px"
                          height="16px"
                          style={{ marginLeft: "4px" }}
                        />
                      </Button>
                    )}

                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => {
                        handleOpenTagModal(value);
                      }}
                    >
                      Edit tag
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
          handleDeleteSingle(deleteModal.selectedFile);
          handleDeleteCleaup();
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
