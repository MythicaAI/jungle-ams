import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import { Drawer, IconButton, Sheet, Stack, Typography } from "@mui/joy";
import { LucideSidebarClose } from "lucide-react";
import { UploadsSubmitList } from "@components/Uploads/UploadsSubmitList";
import { UploadsReadyList } from "@components/Uploads/UploadsReadyList";
import { OpenUploadsState } from "types/assetEditTypes";
import { useEffect } from "react";
import {
  extractValidationErrors,
  translateError,
} from "@services/backendCommon";
import { FileUploadResponse } from "types/apiTypes";
import { FileUploadStatus, useUploadStore } from "@store/uploadStore";
import { AxiosError } from "axios";
import { useStatusStore } from "@store/statusStore";
import { api } from "@services/api";

export interface AssetEditUploadDrawerProps {
  openUploads: OpenUploadsState;
  setOpenUploads: (openUploads: OpenUploadsState) => void;
}

export const AssetEditUploadDrawer: React.FC<AssetEditUploadDrawerProps> = ({
  openUploads,
  setOpenUploads,
}) => {
  const { trackUploads } = useUploadStore();
  const { addError, addWarning } = useStatusStore();

  const onUploadDrawerKeyDown = (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (event.type === "keydown") {
      const key = (event as React.KeyboardEvent).key;
      if (key === "Escape") {
        setOpenUploads({ open: false, opened: false });
      }
    }
  };

  const onClickAway = () => {
    if (openUploads.open && openUploads.opened) {
      setOpenUploads({ open: false, opened: false });
    }
  };

  // handle populating the file uploads if the drawer is opened
  useEffect(() => {
    if (openUploads.open) {
      api
        .get<FileUploadResponse[]>({ path: "/upload/pending" })
        .then((files) => {
          trackUploads(files as FileUploadStatus[]);
        })
        .catch((err) => handleError(err));
    }
  }, [openUploads]);

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  return (
    <ClickAwayListener onClickAway={() => onClickAway()}>
      <Drawer
        open={openUploads.open}
        onKeyDown={onUploadDrawerKeyDown}
        onClose={() => setOpenUploads({ open: false, opened: false })}
        slotProps={{
          content: {
            sx: {
              width: "80%",
            },
          },
        }}
      >
        <Sheet
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography level="h4">Uploads</Typography>
          <IconButton
            onClick={() => setOpenUploads({ open: false, opened: false })}
            variant="plain"
          >
            <LucideSidebarClose />
          </IconButton>
        </Sheet>
        <Stack padding="10px" gap="10px">
          <UploadsSubmitList />
          <UploadsReadyList
            isDrawerOpen={openUploads.open}
            category={openUploads.category}
            fileTypeFilters={
              openUploads.fileTypeFilters ? openUploads.fileTypeFilters : []
            }
          />
        </Stack>
      </Drawer>
    </ClickAwayListener>
  );
};
