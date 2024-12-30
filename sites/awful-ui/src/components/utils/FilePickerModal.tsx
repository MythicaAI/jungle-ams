// FilePickerModal.tsx
import React, { useState, useMemo } from 'react';
import {
  Modal,
  ModalDialog,
  Box,
  Button,
  Checkbox,
  Input,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  Typography,
} from '@mui/joy';
import { GetFileResponse } from '../../types/MythicaApi';

export interface FileItem {
  id: string;
  name: string;
}

interface FilePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
  files: GetFileResponse[];
  initialSelectedFileIds?: string[];
  label?: string;
  searchPlaceholder?: string;
}

/**
 * A reusable file picker in a modal, with search box + multiple selection (via checkboxes).
 */
const FilePickerModal: React.FC<FilePickerModalProps> = ({
  open,
  onClose,
  onSave,
  files,
  initialSelectedFileIds = [],
  label = 'Select Files',
  searchPlaceholder = 'Filter files...',
}) => {
  // Local state for which files are currently checked.
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(
    initialSelectedFileIds
  );
  // Local state for the search box text.
  const [searchTerm, setSearchTerm] = useState('');

  // Filter the files to those that match the search term (case-insensitive).
  const filteredFiles = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return files;
    return files.filter((f) => f.file_name.toLowerCase().includes(lowerSearch));
  }, [files, searchTerm]);

  // Toggle a file’s selection
  const handleToggleFile = (fileId: string) => {
    let newSelected: string[];
    if (selectedFileIds.includes(fileId)) {
      newSelected = selectedFileIds.filter((id) => id !== fileId);
    } else {
      newSelected = [...selectedFileIds, fileId];
    }
    setSelectedFileIds(newSelected);
  };

  // When user clicks "Save", pass the selected IDs up, then close the modal
  const handleSave = () => {
    onSave(selectedFileIds);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="file-picker-modal"
        aria-describedby="file-picker-modal-description"
        size="lg"
        sx={{ width: 800, height: 500 }}
      >
        <Typography id="file-picker-modal" level="title-lg" mb={1}>
          {label}
        </Typography>

        {/* Search Input */}
        <Input
          value={searchTerm}
          placeholder={searchPlaceholder}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            height: 300,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'neutral.outlinedBorder',
            borderRadius: 'sm',
          }}
        >
          <List size="sm">
            {filteredFiles.map((file) => {
              const isChecked = selectedFileIds.includes(file.file_id);
              return (
                <ListItem key={file.file_id}>
                  <ListItemButton
                    selected={isChecked}
                    onClick={() => handleToggleFile(file.file_id)}
                  >
                    <ListItemDecorator>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleToggleFile(file.file_id)}
                      />
                    </ListItemDecorator>
                    <Typography>{file.file_name}</Typography>
                  </ListItemButton>
                </ListItem>
              );
            })}

            {filteredFiles.length === 0 && (
              <ListItem>
                <Typography
                  level="body-sm"
                  sx={{ fontStyle: 'italic', color: 'neutral.500' }}
                >
                  No files found.
                </Typography>
              </ListItem>
            )}
          </List>
        </Box>

        {/* Footer Buttons */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="plain" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default FilePickerModal;
