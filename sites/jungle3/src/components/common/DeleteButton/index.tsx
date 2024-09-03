import React from "react";
import IconButton from "@mui/joy/IconButton";
import { AxiosError } from "axios";
import { LucideCheck, LucideTrash, LucideX } from "lucide-react";
import {
  extractValidationErrors,
  translateError,
} from "@services/backendCommon";
import { useStatusStore } from "@store/statusStore";
import {
  Card,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { api } from "@services/api";

interface DeleteButtonProps {
  url: string;
  name: string;
  onDeleteSuccess?: () => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  url,
  name,
  onDeleteSuccess,
}) => {
  const [open, setOpen] = React.useState(false);
  const { addError, addWarning, setSuccess } = useStatusStore();

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmDelete = () => {
    api
      .del({ path: url })
      .then(() => {
        setSuccess(`Deleted ${name}`);
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      })
      .catch((error) => {
        handleError(error);
      })
      .finally(() => {
        handleClose();
      });
  };

  return (
    <div>
      <IconButton aria-label="delete" onClick={handleClickOpen}>
        <LucideTrash />
      </IconButton>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <ModalClose />
          <Card>
            <Typography>Are you sure you want to delete this item?</Typography>
          </Card>
          <Stack
            direction={"row"}
            spacing={2}
            alignItems="center"
            sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
          >
            <IconButton
              aria-label="cancel"
              onClick={handleClose}
              color="primary"
            >
              <LucideX />
              Cancel
            </IconButton>
            <IconButton
              aria-label="confirm"
              onClick={handleConfirmDelete}
              color="primary"
              autoFocus
            >
              <LucideCheck />
              Confirm
            </IconButton>
          </Stack>
        </ModalDialog>
      </Modal>
    </div>
  );
};
