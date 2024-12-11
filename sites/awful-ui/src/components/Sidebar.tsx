import React, { DragEvent, useEffect, useRef, useState } from 'react';
import useMythicaApi from '../hooks/useMythicaApi';
import useAutomation from '../hooks/useAutomation';
import useAwfulFlow from '../hooks/useAwfulFlow';
import { GetFileResponse } from '../types/MythicaApi';

const Sidebar: React.FC = () => {
  const selectFileRef = useRef<HTMLSelectElement>(null);

  const { setNodeType } = useAwfulFlow();
  const automationContext = useAutomation();
  const { apiKey, setApiKey } = useMythicaApi();

  const { savedAwfulsById, savedAwfulsByName, onRestore, onSave, onNew, onDelete} = useAwfulFlow(); // Import AwfulFlow methods
  const [selectedFile, setSelectedFile] = useState<GetFileResponse | null>(null);
  const [loadedFile, setLoadedFile] = useState<GetFileResponse|null>(null);
  const [filenameInput, setFilenameInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Update when the Selected File changes

  useEffect(() => {
    if (filenameInput) {
      const file_exist = savedAwfulsByName[filenameInput];
      if (file_exist) {
        const select = selectFileRef.current
        if (select) {
          select.value = file_exist.file_id;
          setSelectedFile(file_exist);
        }
      }
    }
  }, [filenameInput, savedAwfulsByName]);


  const handleSelectionChange = async () => {
    const file_id = selectFileRef.current?.value
    if (file_id) {
      setFilenameInput(savedAwfulsById[file_id].file_name);
    } else {
      setFilenameInput('');
    }
  }

  const confirmAction = (message: string): boolean => {
    return window.confirm(message);
  };

  const handleLoadFile = async () => {
    if (!selectedFile) {
      alert('No file selected to load.');
      return;
    }

    if (loadedFile && !confirmAction(
      `This will overwrite current changes. Are you sure?`
    )) return;

    setIsProcessing(true);

    try {
      await onRestore(selectedFile.file_name);
      setLoadedFile(selectedFile);
      console.log(`File "${filenameInput}" loaded successfully.`);
    } catch (error) {
      console.error(`Failed to load file "${selectedFile.file_name}":`, error);
      alert(`Failed to load file "${selectedFile.file_name}". Check the console for details.`);
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

    if (selectedFile 
        && selectedFile.file_name === filenameInput
        && (!loadedFile || loadedFile.file_name !== selectedFile.file_name) 

        && !confirmAction(
      `This action will overwrite ${selectedFile.file_name}. Are you sure you want to continue"?`
    )) return;

    setIsProcessing(true);

    try {
      await onSave(filename, async(saved) =>setLoadedFile(saved));
      setLoadedFile(savedAwfulsByName[filename]);
      console.log(`File "${filename}" saved successfully.`);
    } catch (error) {
      console.error(`Failed to save file "${filename}":`, error);
      alert(`Failed to save file "${filename}". Check the console for details.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return
    if (!confirmAction(
      `This will permanently delete ${selectedFile.file_name}. Are you sure you want to continue"?`
    )) return;

    setIsProcessing(true);

    try {
      await onDelete(selectedFile.file_name);
      setSelectedFile(null);
      setFilenameInput('');
      console.log(`File "${selectedFile.file_name}" saved successfully.`);
    } catch (error) {
      console.error(`Failed to save file "${selectedFile.file_name}":`, error);
      alert(`Failed to save file "${selectedFile.file_name}". Check the console for details.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewFile = async () => {
    const confirmNew = confirmAction('Are you sure you want to create a new file? Unsaved changes will be lost.');

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
      <label htmlFor="apiKey">Api Key:</label>
      <input
        type="text"
        id="apiKey"
        placeholder="Enter API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />

      <div key="Saved Workflows">
        <h3>Saved Workflows</h3>
        {(
          <select
            ref={selectFileRef}
            size={6}
            style={{ 
              width: '100%',
              marginTop: '8px',
              padding: '5px',
              height: '200px',
            }}           
            onChange={handleSelectionChange}
          >
            {Object.entries(savedAwfulsById).map(([ , file]) => (
              <option key={file.file_name + file.file_id} value={file.file_id}>
                {file.file_name || file.file_id}
              </option>
            )).sort((a, b) => (a?.key || -1) < (b?.key || 1) ? -1 : 1)}
          </select>
        )}
        <input
          type="text"
          placeholder="Enter filename"
          value={filenameInput}
          onChange={(e) => setFilenameInput(e.target.value)}
          style={{ 
            width: '95%',
            padding: '5px',
          }}           
        />         
        <div>
          <button
            onClick={handleLoadFile}
            disabled={!selectedFile || isProcessing}>
            Load
          </button>
          <button
            onClick={handleSaveFile}
            disabled={!filenameInput || isProcessing}>
            {selectedFile ? 'Save' : 'Save As...'}
          </button>
          <button
            onClick={handleNewFile}
            disabled={isProcessing}>
            New
          </button>
          <button
            onClick={handleDeleteFile}
            disabled={!selectedFile || isProcessing}>
            Delete
          </button>
        </div>


      </div>
      <div key="Files">
        <h3>Files</h3>

        <div
          className="dndnode"
          onDragStart={(event) => onDragStart(event, 'fileUpload')}
          draggable
        >
          File Upload
        </div>
        <div
          className="dndnode"
          onDragStart={(event) => onDragStart(event, 'fileViewer')}
          draggable
        >
          File Viewer
        </div>
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
                {automation.path}
              </div>
            );
          })}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
