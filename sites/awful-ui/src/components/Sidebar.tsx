import React, { DragEvent, useRef, useState } from 'react';
import useMythicaApi from '../hooks/useMythicaApi';
import useAutomation from '../hooks/useAutomation';
import useAwfulFlow from '../hooks/useAwfulFlow';
import { GetFileResponse } from '../types/MythicaApi';
import {
  Accordion,
  AccordionDetails,
  accordionDetailsClasses,
  AccordionGroup,
  AccordionSummary,
  Box,
  Button,
  FormLabel,
  Input,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy';
import { GripVertical, LucideTrash2 } from 'lucide-react';
import { AutomationSave } from '../types/Automation';
import { TabValues } from '../enums';

type Props = {
  tab: string;
};

const Sidebar: React.FC<Props> = ({ tab }) => {
  const selectFileRef = useRef<HTMLSelectElement>(null);

  const automationContext = useAutomation();
  const { apiKey, setApiKey } = useMythicaApi();

  const { savedAwfulsById, onRestore, onSave, onNew, onDelete, setNodeType } =
    useAwfulFlow(); // Import AwfulFlow methods

  const [selectedFile, setSelectedFile] = useState<GetFileResponse | null>(
    null
  );
  const [loadedFile, setLoadedFile] = useState<GetFileResponse | null>(null);
  const [filenameInput, setFilenameInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const confirmAction = (message: string): boolean => {
    return window.confirm(message);
  };

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
      setFilenameInput(selectedFile.file_name);
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
      await onSave(filename, async (saved) => {
        setLoadedFile(saved);
        setSelectedFile(saved);
      });

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
      {tab === TabValues.API_KEY && (
        <Stack p="8px 12px">
          <FormLabel htmlFor="apiKey" sx={{ fontSize: 18, mb: '8px' }}>
            Api Key:
          </FormLabel>
          <Input
            type="password"
            id="apiKey"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            sx={{
              mb: '12px',
              '&:focus-within': {
                borderColor: 'yellow', // Change this to your desired color
              },
            }}
          />
        </Stack>
      )}

      {tab === TabValues.WORKFLOWS && (
        <Stack gap="8px" key="Saved Workflows" p="8px 12px">
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
              setSelectedFile(savedAwfulsById[newValue]);
            }}
          >
            {Object.entries(savedAwfulsById)
              .map(([, file]) => (
                <Option
                  key={file.file_name + file.file_id}
                  value={file.file_id}
                >
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
      )}
      {tab == TabValues.EDIT && (
        <AccordionGroup
          sx={(theme) => ({
            maxWidth: 400,
            borderRadius: 'lg',
            [`& .${accordionDetailsClasses.content}`]: {
              boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
              padding: '0',
            },
          })}
        >
          <div key="Files">
            <Accordion defaultExpanded>
              <AccordionSummary>
                <Typography fontSize={18} level="h4">
                  Files
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ padding: 0 }}>
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
              </AccordionDetails>
            </Accordion>
          </div>

          {automationContext?.workers.map((worker) => (
            <div key={worker}>
              <Accordion>
                <AccordionSummary>
                  <Typography
                    fontSize={18}
                    level="h4"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {worker}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {automationContext?.automations[worker]?.map((automation) => {
                    if (
                      automation.spec.hidden ||
                      automation.path.endsWith('/mythica/script')
                    )
                      return null;
                    return (
                      <div
                        key={automation.path}
                        className="dndnode"
                        onDragStart={(event) =>
                          onDragStart(event, automation.uri)
                        }
                        draggable
                      >
                        <Typography fontSize={14}>{automation.path}</Typography>
                        <GripVertical />
                      </div>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
              {automationContext.savedAutomationsByWorker[worker]?.map(
                (automation: AutomationSave,index:number) => {
                  return (
                    <div
                      key={automation.id + '_' + index}
                      className="dndnode custom"
                      onDragStart={(event) =>
                        onDragStart(event, `saved?${automation.id}`)
                      }
                      draggable
                      style={{ display: 'flex', flexDirection: 'row' }}
                    >
                      <Typography fontSize={14} style={{ flex: '1 1 auto' }}>
                        {automation.name}
                      </Typography>
                      <LucideTrash2
                        onClick={() =>
                          automationContext.deleteAutomation(automation)
                        }
                        style={{ marginRight: '4px', cursor: 'pointer' }}
                      />
                      <GripVertical />
                    </div>
                  );
                }
              )}
              <div
                key={`${worker}-new`}
                className="dndnode new"
                onDragStart={(event) =>
                  onDragStart(event, `${worker}://mythica/script`)
                }
                draggable
              >
                <Typography fontSize={14}>Create New Automation...</Typography>
                <GripVertical />
              </div>
            </div>
          ))}
        </AccordionGroup>
      )}
    </aside>
  );
};

export default Sidebar;
