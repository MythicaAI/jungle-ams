import React, { DragEvent, useEffect, useRef, useState } from 'react';
import useMythicaApi from '../hooks/useMythicaApi';
import useAutomation from '../hooks/useAutomation';
import useAwfulFlow from '../hooks/useAwfulFlow';
import { GetFileResponse } from '../types/MythicaApi';
import {
  Box,
  Button,
  FormLabel,
  Input,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy';
import { GripVertical } from 'lucide-react';

const Sidebar: React.FC = () => {
  const selectFileRef = useRef<HTMLSelectElement>(null);

  const { setNodeType } = useAwfulFlow();
  const automationContext = useAutomation();
  const { apiKey, setApiKey } = useMythicaApi();

  const { savedAwfulsById, savedAwfulsByName, onRestore, onSave } =
    useAwfulFlow(); // Import AwfulFlow methods
  const [selectedFile, setSelectedFile] = useState<GetFileResponse | null>(
    null
  );
  const [filenameInput, setFilenameInput] = useState<string>('');

  // Update when the Selected File changes

  useEffect(() => {
    if (filenameInput) {
      const file_exist = savedAwfulsByName[filenameInput];
      if (file_exist) {
        const select = selectFileRef.current;
        if (select) {
          select.value = file_exist.file_id;
          setSelectedFile(file_exist);
        }
      }
    }
  }, [filenameInput, savedAwfulsByName]);

  const handleLoadFile = async () => {
    if (selectedFile) {
      try {
        await onRestore(selectedFile.file_name);
        console.log(`File ${selectedFile} loaded successfully`);
      } catch (error) {
        console.error(`Failed to load file ${selectedFile}:`, error);
      }
    }
  };

  const handleSaveFile = async () => {
    const filename = filenameInput.trim();
    if (!filename) {
      alert('Please enter a valid filename.');
      return;
    }
    try {
      await onSave(filename);
      console.log(`File ${filename} saved successfully`);
    } catch (error) {
      console.error(`Failed to save file ${filename}:`, error);
    }
  };

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    setNodeType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
      <FormLabel htmlFor="apiKey">Api Key:</FormLabel>
      <Input
        type="password"
        id="apiKey"
        placeholder="Enter API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        sx={{ mb: '12px' }}
      />

      <Stack gap="8px" key="Saved Workflows">
        <Typography fontSize={18} level="h4">
          Saved Workflows
        </Typography>

        {/*@ts-ignore*/}
        <Select
          ref={selectFileRef}
          placeholder="Select Workflow"
          value={selectedFile?.file_id}
          onChange={(_, newValue) => {
            //@ts-ignore
            setSelectedFile(newValue);
            //@ts-ignore
            setFilenameInput(savedAwfulsById[newValue].file_name);
          }}
        >
          {Object.entries(savedAwfulsById)
            .map(([, file]) => (
              <Option key={file.file_name + file.file_id} value={file.file_id}>
                {file.file_name || file.file_id}
              </Option>
            ))
            .sort((a, b) => ((a?.key || -1) < (b?.key || 1) ? -1 : 1))}
        </Select>
        <Button
          onClick={handleLoadFile}
          disabled={!selectedFile}
          sx={{ width: 'fit-content' }}
        >
          Load
        </Button>

        <Typography fontSize={18} level="h4">
          Save current workflow
        </Typography>
        <div>
          <Input
            type="text"
            placeholder="Enter filename"
            value={filenameInput}
            onChange={(e) => setFilenameInput(e.target.value)}
          />
        </div>
        <Stack direction="row" gap="8px">
          <Button onClick={handleSaveFile}>
            {selectedFile ? 'Save' : 'Save As...'}
          </Button>
        </Stack>
      </Stack>
      <div key="Files">
        <h3>Files</h3>

        <Box
          className="dndnode"
          onDragStart={(event) => onDragStart(event, 'fileUpload')}
          draggable
          sx={{ p: '4px' }}
        >
          <Typography fontSize={14}>File Upload</Typography>
          <GripVertical />
        </Box>
        <Box
          className="dndnode"
          onDragStart={(event) => onDragStart(event, 'fileViewer')}
          draggable
        >
          <Typography fontSize={14}>File Viewer</Typography>
          <GripVertical />
        </Box>
      </div>

      {automationContext?.workers.map((worker) => (
        <div key={worker}>
          <h3>{worker}</h3>
          {automationContext?.automations[worker]?.map((automation) => {
            if (automation.spec.hidden) return null;
            return (
              <div
                key={automation.path}
                className="dndnode"
                onDragStart={(event) => onDragStart(event, automation.uri)}
                draggable
              >
                <Typography fontSize={14}>{automation.path}</Typography>
                <GripVertical />
              </div>
            );
          })}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
