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

  const { savedAwfulsById, savedAwfulsByName, onRestore, onSave } = useAwfulFlow(); // Import AwfulFlow methods
  const [selectedFile, setSelectedFile] = useState<GetFileResponse | null>(null);
  const [filenameInput, setFilenameInput] = useState<string>('');

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
        <div>
          <input
            type="text"
            placeholder="Enter filename"
            value={filenameInput}
            onChange={(e) => setFilenameInput(e.target.value)}
          />         
        </div>
        <div>
          <button onClick={handleLoadFile} disabled={!selectedFile}>
            Load
          </button>
          <button onClick={handleSaveFile}>
            {selectedFile ? 'Save' : 'Save As...'}
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
