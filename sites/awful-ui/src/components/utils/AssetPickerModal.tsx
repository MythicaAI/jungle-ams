// AssetFilePickerModal.tsx
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
import { GetAssetResponse, GetFileResponse } from '../../types/MythicaApi';

interface AssetFilePickerModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Called with the list of selected file IDs from the chosen asset.
   */
  onSave: (selectedFileIds: string[]) => void;
  /**
   * The list of assets to choose from.
   */
  assets: GetAssetResponse[];
  /**
   * Optional list of file IDs that should be pre-selected.
   */
  selectedFileIds?: string[];
  label?: string;
  searchPlaceholder?: string;
}

/**
 * A modal that displays two lists:
 * 1. A list of assets to choose from.
 * 2. A list of files from the selected asset.
 * The user can then select files from the chosen asset.
 */
const AssetFilePickerModal: React.FC<AssetFilePickerModalProps> = ({
  open,
  onClose,
  onSave,
  assets,
  selectedFileIds = [],
  label = 'Select Files from Asset',
  searchPlaceholder = 'Filter files...',
}) => {
  // State for which asset is currently selected.
  const [selectedAsset, setSelectedAsset] = useState<GetAssetResponse | null>(
    assets?.length > 0 ? assets[0] : null
  );
  // Local state for selected file IDs.
  const [prvSelectedFileIds, setPrvSelectedFileIds] = useState<string[]>([]);
  // State for filtering file list.
  const [searchTerm, setSearchTerm] = useState('');

  // Whenever the modal opens, initialize local state from the props.
  useEffect(() => {
    if (open) {
      setPrvSelectedFileIds(selectedFileIds);
      setSearchTerm('');
    }
  }, [open, selectedFileIds]);

  // Handle asset selection.
  const handleSelectAsset = (asset: GetAssetResponse) => {
    setSelectedAsset(asset);
    setPrvSelectedFileIds([]); // Clear selections when switching assets
  };

  // Memoized file list from the selected asset
  const assetFiles: GetFileResponse[] = useMemo(() => {
    return selectedAsset?.contents.files || [];
  }, [selectedAsset]);

  // Filter files based on the search term (case-insensitive).
  const filteredFiles = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return assetFiles;
    return assetFiles.filter((file) =>
      file.file_name.toLowerCase().includes(lowerSearch)
    );
  }, [assetFiles, searchTerm]);

  // Toggle file selection.
  const handleToggleFile = (fileId: string) => {
    setPrvSelectedFileIds((prevSelected) =>
      prevSelected.includes(fileId)
        ? prevSelected.filter((id) => id !== fileId)
        : [...prevSelected, fileId]
    );
    return true;
  };

  // When the user clicks "Save", pass the selected file IDs up and close the modal.
  const handleSave = () => {
    onSave(prvSelectedFileIds);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="asset-file-picker-modal"
        size="lg"
        sx={{ width: 900, height: 580 }}
      >
        <Typography id="asset-file-picker-modal" level="title-lg" mb={1}>
          {label}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Asset List */}
          <Box sx={{ width: '40%', overflowY: 'auto', maxHeight: 400 }}>
            <Typography level="body-lg" mb={1}>
              Select Package
            </Typography>
            <List size="sm">
              {assets.map((asset) => (
                <ListItem key={asset.asset_id}>
                  <ListItemButton
                    selected={selectedAsset?.asset_id === asset.asset_id}
                    onClick={() => handleSelectAsset(asset)}
                  >
                    <Typography>{asset.name}</Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* File List */}
          <Box sx={{ width: '60%', overflowY: 'auto', maxHeight: 400 }}>
            <Typography level="body-lg" mb={1}>
              Select Files from {selectedAsset?.name || 'Package'}
            </Typography>
            <Input
              value={searchTerm}
              placeholder={searchPlaceholder}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />
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
                            onClick={(e) => {
                            e.stopPropagation(); // Prevent ListItemButton from also triggering
                            handleToggleFile(file.file_id);
                            }}
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

export default AssetFilePickerModal;
