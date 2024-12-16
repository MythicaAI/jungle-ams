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
import { AutomationSave } from '../types/Automation';

const Sidebar: React.FC = () => {
  const selectFileRef = useRef<HTMLSelectElement>(null);

  const { setNodeType } = useAwfulFlow();
  const automationContext = useAutomation();
  const { apiKey, setApiKey } = useMythicaApi();

  const {
    savedAwfulsById,
    savedAwfulsByName,
    onRestore,
    onSave,
    onNew,
    onDelete,
  } = useAwfulFlow(); // Import AwfulFlow methods

  const [selectedFile, setSelectedFile] = useState<GetFileResponse | null>(
    null
  );
  const [loadedFile, setLoadedFile] = useState<GetFileResponse | null>(null);
  const [filenameInput, setFilenameInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const confirmAction = (message: string): boolean => {
    return window.confirm(message);
  };

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
    if (!selectedFile) {
      alert('No file selected to load.');
      return;
    }

    if (
      loadedFile &&
      !confirmAction(`This will overwrite current changes. Are you sure?`)
    )
      return;

    setIsProcessing(true);

    try {
      await onRestore(selectedFile.file_name);
      setLoadedFile(selectedFile);
      console.log(`File "${filenameInput}" loaded successfully.`);
    } catch (error) {
      console.error(`Failed to load file "${selectedFile.file_name}":`, error);
      alert(
        `Failed to load file "${selectedFile.file_name}". Check the console for details.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveFile = async () => {
    const filename = filenameInput.trim();

    if (!filename) {
      alert('Please enter a valid filename.');
      return;
    }

    if (
      selectedFile &&
      selectedFile.file_name === filenameInput &&
      (!loadedFile || loadedFile.file_name !== selectedFile.file_name) &&
      !confirmAction(
        `This action will overwrite ${selectedFile.file_name}. Are you sure you want to continue"?`
      )
    )
      return;

    setIsProcessing(true);

    try {
      await onSave(filename, async (saved) => setLoadedFile(saved));
      setLoadedFile(savedAwfulsByName[filename]);
      console.log(`File "${filename}" saved successfully.`);
    } catch (error) {
      console.error(`Failed to save file "${filename}":`, error);
      alert(
        `Failed to save file "${filename}". Check the console for details.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    if (
      !confirmAction(
        `This will permanently delete ${selectedFile.file_name}. Are you sure you want to continue"?`
      )
    )
      return;

    setIsProcessing(true);

    try {
      await onDelete(selectedFile.file_name);
      setSelectedFile(null);
      setFilenameInput('');
      console.log(`File "${selectedFile.file_name}" saved successfully.`);
    } catch (error) {
      console.error(`Failed to save file "${selectedFile.file_name}":`, error);
      alert(
        `Failed to save file "${selectedFile.file_name}". Check the console for details.`
      );
    } finally {
      setIsProcessing(false);
    }
  };


  const handleNewFile = async () => {
    const confirmNew = confirmAction(
      'Are you sure you want to create a new file? Unsaved changes will be lost.'
    );

    if (!confirmNew) return;

    setIsProcessing(true);

    try {
      await onNew();
      setLoadedFile(null);
      setFilenameInput('');
      setSelectedFile(null);
      if (selectFileRef.current) {
        selectFileRef.current.selectedIndex = -1;
      }
      console.log('New file created successfully.');
    } catch (error) {
      console.error('Failed to create a new file:', error);
      alert('Failed to create a new file. Check the console for details.');
    } finally {
      setIsProcessing(false);
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
            setFilenameInput(savedAwfulsById[newValue]?.file_name);
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
          <Button
            variant="soft"
            onClick={handleNewFile}
            disabled={isProcessing}
          >
            New
          </Button>
          <Button onClick={handleSaveFile}>
            {selectedFile ? 'Save' : 'Save As...'}
          </Button>
          <Button
            onClick={handleDeleteFile}
            disabled={!selectedFile || isProcessing}
            color="danger"
          >
            Delete
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
            if (automation.spec.hidden || automation.path.endsWith('/mythica/script')) return null;
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
          {automationContext.savedAutomationsByWorker[worker]?.map((automation:AutomationSave) => {
            return (
              <div
                key={automation.id}
                className="dndnode custom"
                onDragStart={(event) => onDragStart(event, `saved?${automation.id}`)}
                draggable
                style={{display:'flex', flexDirection:'row'}}
              >
                <Typography fontSize={14} style={{flex:'1 1 auto'}}>
                  {automation.name} 
                </Typography>
                <button 
                    onClick={()=>automationContext.deleteAutomation(automation)}
                    style={{ float:'right', color:'red', background:'none', border:'1px solid black', cursor:'pointer'}}
                  >
                  x
                </button>
                <GripVertical />
              </div>
            );
          })}
          <div
            key={`${worker}-new`}
            className="dndnode new"
            onDragStart={(event) => onDragStart(event, `${worker}://mythica/script`)}
            draggable
          >
            <Typography fontSize={14}>Create New Automation...</Typography>
            <GripVertical />
          </div>          
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
