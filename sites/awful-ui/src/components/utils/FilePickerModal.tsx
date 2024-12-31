// FilePickerModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
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

interface FilePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
  files: GetFileResponse[];
  selectedFileIds?: string[];
  label?: string;
  searchPlaceholder?: string;
}

/**
 * A reusable file picker in a modal, with:
 *  1) Sort by file name
 *  2) show selected files on top
 *  3) Clear button to remove all selections
 */
const FilePickerModal: React.FC<FilePickerModalProps> = ({
  open,
  onClose,
  onSave,
  files,
  selectedFileIds = [],
  label = 'Select Files',
  searchPlaceholder = 'Filter files...',
}) => {
  // Local state for which files are currently checked.
  const [prvSelectedFileIds, setPrvSelectedFileIds] = useState<string[]>([]);
  const [resort, setResort] = useState(false);
  // Local state for the search box text.
  const [searchTerm, setSearchTerm] = useState('');

  // Whenever the modal opens, reset local state from the prop
  useEffect(() => {
    if (open) {
      setPrvSelectedFileIds(selectedFileIds);
      setSearchTerm('');
      setResort(!resort);
    }
  }, [open, selectedFileIds]);

  // Memo: sort files by file_name, then optionally reorder selected to top if this is the initial render
  const sortedFiles = useMemo(() => {
    // 1) Sort by file_name
    const sorted = [...files].sort((a, b) =>
      a.file_name.localeCompare(b.file_name)
    );

    // 2) If it's the first render, reorder so that selected files appear first
    if (selectedFileIds.length > 0) {
      sorted.sort((a, b) => {
        const aSelected = selectedFileIds.includes(a.file_id);
        const bSelected = selectedFileIds.includes(b.file_id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });
    }

    return sorted;
  }, [files, resort]);

  // Filter the sorted files by the search term (case-insensitive).
  const filteredFiles = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return sortedFiles;
    return sortedFiles.filter((f) =>
      f.file_name.toLowerCase().includes(lowerSearch)
    );
  }, [sortedFiles, searchTerm]);

  // Toggle a file’s selection
  const handleToggleFile = (fileId: string) => {
    let newSelected: string[];
    if (prvSelectedFileIds.includes(fileId)) {
      newSelected = prvSelectedFileIds.filter((id) => id !== fileId);
    } else {
      newSelected = [...prvSelectedFileIds, fileId];
    }
    setPrvSelectedFileIds(newSelected);
  };

  // When user clicks "Save", pass the selected IDs up, then close
  const handleSave = () => {
    onSave(prvSelectedFileIds);
  };

  // Clear all selections
  const handleClearAll = () => {
    setPrvSelectedFileIds([]);
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
              const isChecked = prvSelectedFileIds.includes(file.file_id);
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
          <Button variant="plain" color="neutral" onClick={handleClearAll}>
            Clear
          </Button>
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
