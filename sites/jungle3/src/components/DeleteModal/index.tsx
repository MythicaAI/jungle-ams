import {
  Modal,
  ModalDialog,
  ModalClose,
  Card,
  Typography,
  Stack,
  IconButton,
} from "@mui/joy";
import { LucideX, LucideCheck } from "lucide-react";

type Props = {
  open: boolean;
  handleConfirm: () => void;
  handleClose?: () => void;
};

export const DeleteModal: React.FC<Props> = ({
  open,
  handleClose,
  handleConfirm,
}) => {
  return (
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
          <IconButton aria-label="cancel" onClick={handleClose} color="primary">
            <LucideX />
            Cancel
          </IconButton>
          <IconButton
            aria-label="confirm"
            onClick={handleConfirm}
            color="primary"
            autoFocus
          >
            <LucideCheck />
            Confirm
          </IconButton>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};
