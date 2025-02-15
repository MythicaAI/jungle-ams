import React, { useState, useEffect, useMemo, memo } from 'react';
import { Card, Typography, Box, List, ListItem, ListItemButton, ListItemDecorator, Checkbox, Input } from '@mui/joy';
import { GetFileResponse, GetAssetResponse } from '../../types/MythicaApi';
import { useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import useMythicaApi from '../../hooks/useMythicaApi';
import useAwfulFlow from '../../hooks/useAwfulFlow';
import { NodeDeleteButton } from '../NodeDeleteButton';
import { NodeHeader } from '../NodeHeader';
import FileOutputHandle from '../handles/FileOutputHandle';

interface AssetViewerNodeProps {
  id: string;
  selected?: boolean;
  data: {
    selectedAssetId: string;
    selectedFileIds: string[];
  };
}


const AssetViewerNode: React.FC<AssetViewerNodeProps> = (node) => {
  const { getAssets } = useMythicaApi();
  const { setFlowData, NodeResizer } = useAwfulFlow();
  const { deleteElements } = useReactFlow();

  const [assets, setAssets] = useState<GetAssetResponse[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<GetAssetResponse | undefined>();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  
  const [selectedFiles, setSelectedFiles] = useState<GetFileResponse[]>([]);

  const [flowKeys, setFlowKeys] = useState<string[]>([]);
  
  const updateNodeInternals = useUpdateNodeInternals();

  const handleSelectAsset = (asset: GetAssetResponse) => {
    setSelectedAsset(asset);
    setSelectedFiles([]);
  };

  const filteredFiles = useMemo(() => {
    if (!selectedAsset) return [];
    const lowerSearch = searchTerm.toLowerCase().trim();
    return selectedAsset.contents.files.filter((file) =>
      file.file_name.toLowerCase().includes(lowerSearch)
    );
  }, [selectedAsset, searchTerm]);

  const handleToggleFile = (fileId: string) => {
    const file = filteredFiles.find((f) => f.file_id === fileId);
    if (!file) return;
    setSelectedFiles((prevSelected) =>
      prevSelected.some((f) => f.file_id === fileId)
        ? prevSelected.filter((f) => f.file_id !== fileId)
        : [...prevSelected, file]
    );
  };



  const updateFlow = () => {
    const fileTypes = new Map<string, GetFileResponse[]>();
    selectedFiles.forEach((file) => {
      const fileType = file.file_name.split('.').pop() || '';
      const existingFiles = fileTypes.get(fileType) || [];
      fileTypes.set(fileType, [...existingFiles, file]);
    });

    // Set flow data for each file type.
    fileTypes.forEach((files, fileType) => {
      setFlowData(node.id, fileType, files);
    });
    setFlowKeys(Array.from(fileTypes.keys()));
  };

  useEffect(() => {
    getAssets().then(setAssets);
  }, [getAssets]);

  useEffect(() => {
    if (!selectedAsset) {
      const myasset = assets.find((asset) => asset.asset_id === node.data.selectedAssetId)
      if (myasset) {
        setSelectedAsset(myasset);
        setSelectedFiles(myasset.contents.files.filter((file) => node.data.selectedFileIds.includes(file.file_id)));
      }
    } else {
      updateNodeInternals(node.id);
    }
  }, [assets]);

  useEffect(() => {
    updateNodeInternals(node.id);
  }, [flowKeys]);

  useEffect(() => {
    if (!selectedAsset) return;
    updateFlow();
    
    node.data.selectedAssetId = selectedAsset.asset_id;
    node.data.selectedFileIds = selectedFiles.map((file)=>file.file_id);
  }, [selectedFiles]);



  

  // Determine if all filtered files are selected
  const allFilesSelected = useMemo(
    () =>
      filteredFiles.length > 0 &&
      filteredFiles.every((file) => selectedFiles.some((f) => f.file_id === file.file_id)),
    [filteredFiles, selectedFiles]
  );

  const handleSelectAll = () => {
    if (allFilesSelected) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles);
    }
  };


  return (
    <Card
      className={`mythica-node asset-viewer-node ${node.selected && 'selected'}`}
      sx={{
        minWidth: 400,
        height: '100%',
        display: 'flex',
        minHeight: 300,
        flexDirection: 'column',
        paddingTop: '50px',
      }}
    >
      <NodeDeleteButton onDelete={() => deleteElements({ nodes: [node] })} />
      <NodeHeader />
      <NodeResizer minHeight={100} minWidth={300} />

      <Typography level="h4" sx={{ mb: 1 }}>
        Package Loader
      </Typography>

      {/* Content container */}
      <Box
        sx={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden' }}
        className="nowheel nodrag"
      >
        {/* Asset List */}
        <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography level="body-lg" mb={1}>
            Select Package:
          </Typography>
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <List size="sm">
              {assets.map((asset) => (
                <ListItem key={asset.asset_id}>
                  <ListItemButton
                    selected={selectedAsset?.asset_id == asset.asset_id}
                    onClick={() => handleSelectAsset(asset)}
                  >
                    <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {asset.name}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>

        {/* File List */}
        <Box sx={{ width: '60%', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography level="body-lg" mb={1}>
            {selectedAsset?.name || 'None'} Package Files:
          </Typography>
          <Input
            value={searchTerm}
            placeholder="Filter files..."
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 1 }}
          />

          {/* Header row with "Select All" */}
          <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.5, borderBottom: '1px solid #ccc' }}>
            <Checkbox
              checked={allFilesSelected}
              onChange={handleSelectAll}
              sx={{ mr: 1 }}
            />
            <Typography sx={{ flex: 1, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              Select All
            </Typography>
          </Box>

          {/* File List */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <List size="sm">
              {filteredFiles.map((file) => {
                const isChecked = selectedFiles.find((f) => f.file_id === file.file_id)?true:false;
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
                            e.stopPropagation();
                            handleToggleFile(file.file_id);
                          }}
                        />
                      </ListItemDecorator>
                      <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.file_name}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}
              {filteredFiles.length === 0 && (
                <ListItem>
                  <Typography level="body-sm" sx={{ fontStyle: 'italic', color: 'neutral.500' }}>
                    No files found.
                  </Typography>
                </ListItem>
              )}
            </List>
          </Box>
        </Box>
      </Box>


      <div style={{ height: '24px' }} />

      {/* Output handle */}
      {flowKeys.map((key, index, array) => (
        <FileOutputHandle
          nodeId={node.id}
          key={key}
          id={key} 
          left={`${(index + 1) * (100 / (array.length + 1))}%`} 
          isConnectable 
          style={{ background: '#555' }} 
          label={key} />
      ))}

    </Card>
  );
};

export default memo(AssetViewerNode);
