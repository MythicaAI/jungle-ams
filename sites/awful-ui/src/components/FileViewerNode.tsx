// FileViewerNode.tsx
import React, { useState, useEffect } from 'react';
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
  const { getFile, getDownloadInfo } = useMythicaApi();
  const { flowData, setFlowData, notifyTargets } = useAwfulFlow();
  const [downloadInfo, setDownloadInfo] = useState<Array<GetDownloadInfoResponse | null>>([]);
  const [selectedPane, setSelectedPane] = useState(0);
  
  const inputFlowData = (flowData[id] || {})[INPUT_FILES] as (GetFileResponse|null)[];
  
  const file_ids = (inputFlowData as GetFileResponse[])
    ?.map((file: GetFileResponse) => file?.file_id || '')
    .join(', ')
    || '';

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
    };

    inputFlowData && getDownloads(inputFlowData).then((dInfos) => setDownloadInfo(dInfos));
  }, [setDownloadInfo, inputFlowData, id, getDownloadInfo, setFlowData, notifyTargets]);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\s/g, '');
    const files: Array<GetFileResponse | null> = [];
    if (!clean.match(/^,*$/g)) {
      for (const file_id of clean.split(',')) {
        try {
          files.push(await getFile(file_id));
        } catch (error) {
          files.push(null);
        }
      }
    }
    setFlowData(id, INPUT_FILES, files);
  };

  return (
    <div className="mythica-node file-viewer-node">
      <h3>File Viewer</h3>

      {/* Input for manual file ID entry */}
      <input
        type="text"
        defaultValue={file_ids || ''}
        onBlur={handleFilesChange}
        placeholder="File_IDs separated by commas"
        style={{ width: '96%', marginBottom: '10px' }}
      />

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
                      {fileInfo.content_type === 'application/jpeg' ||
                      fileInfo.content_type === 'application/jpg' ||
                      fileInfo.content_type === 'application/gif' ||
                      fileInfo.content_type === 'application/png' ||
                      fileInfo.content_type.startsWith('image/') ? (
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
