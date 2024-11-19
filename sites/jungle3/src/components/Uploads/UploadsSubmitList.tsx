import {
  Button,
  Card,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  styled,
  Table,
} from "@mui/joy";
import { v4 } from "uuid";
import { jwtDecode } from "jwt-decode";
import {
  extractValidationErrors,
  postData,
  translateError,
} from "@services/backendCommon";
import { UploadResponse } from "types/apiTypes";
import { useStatusStore } from "@store/statusStore";
import { AxiosError, AxiosProgressEvent, AxiosRequestConfig } from "axios";
import { FileObj, FileUploadStatus, useUploadStore } from "@store/uploadStore";
import { UploadButton } from "@components/common/UploadButton";
import { LucideUploadCloud } from "lucide-react";
import Cookies from "universal-cookie";
import { useTranslation } from "react-i18next";
import {
  useAssignTagToFile,
  useCreateFileTag,
  useGetFileTags,
  useRemoveTagFromFile,
} from "@queries/tags";
import { useGlobalStore } from "@store/globalStore";
import { TAGS_ROLE } from "@components/AssetEdit/AssetEditDetailControls";

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

export const UploadsSubmitList = function () {
  const { trackUploads, pendingUploads, setUploadProgress, setPendingUploads } =
    useUploadStore();
  const { setSuccess, addError, addWarning } = useStatusStore();
  const { data: fileTags, isLoading } = useGetFileTags();
  const { mutate: assignTagToAsset, isPending: isAssignTagToAssetLoading } =
    useAssignTagToFile();
  const { mutate: createTag, isPending: isCreateTagLoading } =
    useCreateFileTag();

  const { orgRoles } = useGlobalStore();
  const cookies = new Cookies();
  const { t } = useTranslation();
  const hasTagsRole =
    orgRoles && orgRoles.some((entry) => entry.role === TAGS_ROLE);

  console.log("orgRoles: ", orgRoles);

  console.log("pendingUploads: ", pendingUploads);

  const authTokenFromCookies = cookies.get("auth_token");
  const decodedToken = jwtDecode(authTokenFromCookies);
  console.log("decodedToken: ", decodedToken);

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  const onUploadProgress = (event: AxiosProgressEvent) => {
    console.log("progress:", event.progress);
    if (!event.progress) {
      setUploadProgress(10);
    } else {
      setUploadProgress(event.progress);
    }
  };

  const onUploadFiles = function () {
    if (!pendingUploads) {
      return;
    }

    setUploadProgress(0);

    // create the form data
    const formData = new FormData();
    pendingUploads.forEach((item) => {
      formData.append("files", item.file, item.file.name);
    });

    // configure axios for uploading
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${authTokenFromCookies}`,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onUploadProgress,
    };

    postData<UploadResponse>("upload/store", formData, config)
      .then((r) => {
        const uploads: FileUploadStatus[] = r.files.map((f) => ({
          ...f,
          progress: 0,
        }));
        trackUploads(uploads);
        setSuccess(`${uploads.length} uploaded`);
        const uploadedFiles = r.files;

        pendingUploads.forEach((upload) => {
          const uploadedFile = uploadedFiles.find(
            (obj) =>
              obj.file_name === upload.file.name &&
              obj.size === upload.file.size,
          );
          if (!uploadedFile) return;

          if (upload.tag && !upload.customTag) {
            return assignTagToAsset({
              tag_id: upload.tag,
              type_id: uploadedFile.file_id,
            });
          }

          if (upload.customTag && !upload.tag) {
            return createTag(upload.customTag, {
              onSuccess: (res) =>
                assignTagToAsset({
                  tag_id: res?.tag_id,
                  type_id: uploadedFile.file_id,
                }),
              onError: (err: any) => {
                handleError(err);
              },
            });
          }
        });
      })
      .catch((err) => handleError(err))
      .finally(() => {
        setTimeout(() => {
          setUploadProgress(100);
          setTimeout(() => {
            setPendingUploads([]);
            setUploadProgress(0);
          }, 250);
        }, 500);
      });
  };
  const onFileInputChanged = () => {
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    const fileList = fileInput.files;

    if (!fileList) {
      console.log("no fileList found");
      return;
    }
    const payload = Array.from(fileList).map((item) => ({
      file: item,
      tag: "",
      customTag: "",
      id: v4(),
    }));

    setPendingUploads([...pendingUploads, ...payload]);
    fileInput.value = "";
  };

  console.log("pendingUploads: ", pendingUploads);

  const showPendingUploads = () =>
    !(!pendingUploads || pendingUploads.length == 0);

  return (
    <Card>
      <Button
        component="label"
        role={undefined}
        tabIndex={-1}
        variant="plain"
        color="neutral"
        startDecorator={<LucideUploadCloud />}
      >
        {t("myUploads.uploadFiles")}
        <VisuallyHiddenInput
          type="file"
          id="file-input"
          multiple={true}
          onChange={onFileInputChanged}
        />
      </Button>
      {showPendingUploads() ? (
        <>
          {" "}
          <Table aria-label="basic table">
            <thead>
              <tr>
                <th align="left">{t("myUploads.pendingUpload")}</th>
                <th align="right" style={{ textAlign: "right" }}>
                  {t("myUploads.size")}
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingUploads.map((item) => (
                <>
                  <tr key={v4()}>
                    <td align="left" style={{ borderBottom: "none" }}>
                      {item.file.name}
                    </td>
                    <td align="right" style={{ borderBottom: "none" }}>
                      {item.file.size}
                    </td>
                  </tr>
                  {(fileTags || hasTagsRole) && (
                    <tr>
                      <td>
                        <FormControl sx={{ marginBottom: "6px" }}>
                          <Select
                            disabled={!!item.customTag}
                            name="tag"
                            value={item.tag}
                            onChange={(_, newValue) => {
                              const updatedFiles = updateFileTag(
                                pendingUploads,
                                item.id,
                                (item) => {
                                  return {
                                    ...item,
                                    customTag: "",
                                    tag: newValue as string,
                                  };
                                },
                              );
                              setPendingUploads(updatedFiles);
                            }}
                            placeholder="Select a tag"
                          >
                            {fileTags?.map((tag) => (
                              <Option value={tag.tag_id}>{tag.name}</Option>
                            ))}
                          </Select>
                        </FormControl>
                      </td>

                      <td>
                        <FormControl sx={{ marginBottom: "6px" }}>
                          <Input
                            name="customFileTag"
                            variant="outlined"
                            placeholder="Create a new tag"
                            value={item.customTag}
                            onChange={(e) => {
                              const updatedFiles = updateFileTag(
                                pendingUploads,
                                item.id,
                                (item) => {
                                  return {
                                    ...item,
                                    customTag: e.target.value as string,
                                    tag: "",
                                  };
                                },
                              );
                              setPendingUploads(updatedFiles);
                            }}
                          />
                        </FormControl>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </Table>
          <UploadButton onUploadFiles={onUploadFiles} />{" "}
        </>
      ) : (
        ""
      )}
    </Card>
  );
};

function updateFileTag(
  array: FileObj[],
  id: string,
  modifyCallback: (payload: FileObj) => FileObj,
) {
  return array.map((item) => (item.id === id ? modifyCallback(item) : item));
}
