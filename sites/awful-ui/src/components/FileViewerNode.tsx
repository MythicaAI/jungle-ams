import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';

import useMythicaApi from '../hooks/useMythicaApi';
import useAwfulFlow from '../hooks/useAwfulFlow';

import USDViewer from './USDViewer';
import { GetDownloadInfoResponse, GetFileResponse } from '../types/MythicaApi';

interface FileViewerNodeProps {
  id: string;
}

const INPUT_FILES = 'inputFiles';
const OUTPUT_FILES = 'outputFiles';

const FileViewerNode: React.FC<FileViewerNodeProps> = ({ id }) => {
  const selectFileRef = useRef<HTMLSelectElement>(null);
  const { getFiles, getDownloadInfo } = useMythicaApi();
  const { flowData, setFlowData, notifyTargets } = useAwfulFlow();
  const [apiFiles, setApiFiles] = useState<GetFileResponse[]>([]);
  const [downloadInfo, setDownloadInfo] = useState<Array<GetDownloadInfoResponse | null>>([]);
  const [selectedPane, setSelectedPane] = useState(0);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  
  const inputFlowData = (flowData[id] || {})[INPUT_FILES] as (GetFileResponse | null)[];

  // Fetch available files for the file chooser whenever te file selector is shown
  useEffect(() => {
    const fetchAvailableFiles = async () => {
      try {
        const files = await getFiles();
        setApiFiles(files);
      } catch (error) {
        console.error('Error fetching available files:', error);
      }
    };

    if (showFileSelector) fetchAvailableFiles();
  }, [showFileSelector, getFiles]);


  //get download info for selected files whenever inputFlowData changes
  useEffect(() => {
    const getDownloads = async (files: Array<GetFileResponse | null>): Promise<Array<GetDownloadInfoResponse | null>> => {
      const dInfos: Array<GetDownloadInfoResponse | null> = [];
      for (const file of files) {
        try {
          if (!file) throw new Error();
          dInfos.push(await getDownloadInfo(file.file_id));
        } catch {
          dInfos.push(null);
        }
      }
      setFlowData(id, OUTPUT_FILES, files);
      notifyTargets(id, OUTPUT_FILES, files);
      return dInfos;
    }
    inputFlowData && getDownloads(inputFlowData).then((dInfos) => setDownloadInfo(dInfos));
  }, [inputFlowData, setDownloadInfo, getDownloadInfo, setFlowData, id, notifyTargets]);

  // Update the selected files whenever the file selector is closed
  useEffect(() => {
    const handleFileSelection = () => {
      if (!selectFileRef) return;
      const filesById = new Map<string, GetFileResponse>();
      apiFiles.forEach((file)=>{
        if (file)
          filesById.set(file.file_id, file);
      });

      const selectedFiles = [];
      const options = selectFileRef.current?.selectedOptions;
      if (options) {
        for(const option of options){
          const file = filesById.get(option.value);
          file && selectedFiles.push(file);
        }
      }
      const selectedNames = selectedFiles.map(file => file.file_name);
      
      setSelectedFileNames(selectedNames);
      
      setFlowData(id, INPUT_FILES, selectedFiles);
    };
  
    if (!showFileSelector) handleFileSelection()
  }, [showFileSelector, apiFiles, setFlowData, id]);
  


  return (
    <div className="mythica-node file-viewer-node">
      <h3>File Viewer</h3>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            onClick={() => setShowFileSelector(!showFileSelector)}
            type="text"
            value={selectedFileNames.join(', ') || 'Click to Select Files...'}
            readOnly
            style={{ 
              flex: 1,
              padding: '4px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={() => setShowFileSelector(!showFileSelector)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showFileSelector ? 'Apply' : 'Select'}
          </button>
        </div>

        {(
          <select
            ref={selectFileRef}
            multiple
            style={{ 
              visibility: showFileSelector ? 'visible' : 'hidden',
              display: showFileSelector ? 'block' : 'none',
              width: '100%',
              marginTop: '8px',
              padding: '5px',
              height: '200px',
              maxHeight:'600px'
            }}
          >
            {apiFiles.map((file) => (
              <option key={file.file_id} value={file.file_id}>
                {file.file_name || file.file_id}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Target handle for accepting incoming file ID connections */}
      <div
        className="file-handle"
        style={{
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          id={INPUT_FILES}
          isConnectable
          style={{ background: '#555' }}
        />
        <span className="label">Inputs[ ]</span>
      </div>

      {(!downloadInfo || downloadInfo.length === 0) ? (
        <div />
      ) : (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #ccc' }}>
              {downloadInfo.map((fileInfo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPane(index)}
                  style={{
                    flex: 'none',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    borderBottom: selectedPane === index ? '2px solid #007bff' : 'none',
                    background: selectedPane === index ? '#f0f0f0' : '#fff',
                  }}
                >
                  {fileInfo?.name || 'Error!'}
                </button>
              ))}
            </div>

            {/* Pane Content */}
            <div style={{ position: 'relative', height: '400px', width: '400px' }}>
              {downloadInfo.map((fileInfo, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    visibility: index === selectedPane ? 'visible' : 'hidden',
                  }}
                >
                  {fileInfo ? (
                    <>
                      {fileInfo.content_type.startsWith('image/') ? (
                        <img
                          src={fileInfo.url}
                          alt={fileInfo.name}
                          className="imageviewer"
                          style={{ maxWidth: '100%' }}
                        />
                      ) : fileInfo.content_type === 'application/json' ? (
                        <div>
                          <a href={fileInfo.url}>{fileInfo.name}</a> - {fileInfo.content_type}
                        </div>
                      ) : fileInfo.content_type === 'application/usd' ||
                        fileInfo.content_type === 'application/usdz' ? (
                        <USDViewer
                          src={fileInfo.url}
                          alt={fileInfo.name}
                          style={{ height: 400, width: 400 }}
                        />
                      ) : (
                        <p>Unsupported file type: {fileInfo.content_type}</p>
                      )}
                    </>
                  ) : (
                    <p>Error loading file</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Source handle for passing the file ID downstream */}
      <div
        className="file-handle"
        style={{
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Handle
          type="source"
          position={Position.Bottom}
          id={OUTPUT_FILES}
          isConnectable
          style={{ background: '#007bff' }}
        />
        <span className="label">Outputs[ ]</span>
      </div>
      <p />
    </div>
  );
};

export default FileViewerNode;
