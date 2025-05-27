import {
  IconButton,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy';
import { LucideCheck, LucideX } from 'lucide-react';
import React, { useState } from 'react';

type Props = {
  onDelete: () => void;
};

export const NodeDeleteButton: React.FC<Props> = ({ onDelete }) => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton
        sx={{
          padding: 0,
          width: '30px',
          height: '30px',
          minWidth: 0,
          minHeight: 0,
          position: 'absolute',
          right: '7px',
          top: '6px',
          zIndex: 1,
        }}
        color="neutral"
        onClick={onDelete}
      >
        <LucideX size={20} />
      </IconButton>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog sx={{ width: '100%', maxWidth: '400px' }}>
          <ModalClose />
          <Typography>Are you sure you want to delete this node?</Typography>
          <Stack
            direction={'row'}
            spacing={2}
            alignItems="center"
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}
          >
            <IconButton
              aria-label="cancel"
              onClick={handleClose}
              color="neutral"
            >
              <LucideX />
              Cancel
            </IconButton>
            <IconButton
              aria-label="confirm"
              onClick={onDelete}
              color="neutral"
              autoFocus
            >
              <LucideCheck />
              Confirm
            </IconButton>
          </Stack>
        </ModalDialog>
      </Modal>
    </>
  );
};
