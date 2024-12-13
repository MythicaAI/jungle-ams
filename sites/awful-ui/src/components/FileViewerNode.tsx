import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

import useMythicaApi from '../hooks/useMythicaApi';
import useAwfulFlow from '../hooks/useAwfulFlow';

import USDViewer from './viewers/USDViewer';
import { GetDownloadInfoResponse, GetFileResponse } from '../types/MythicaApi';

import CodeViewer from './viewers/CodeViewer';
import FileInputHandle from './handles/FileInputHandle';
import FileOutputHandle from './handles/FileOutputHandle';
interface FileViewerNodeProps {
  id: string;
  selected?: boolean;
  data:{
    selectedPane: number;
    selectedFileIds: string[]; 
    selectedFileNames: string[];
  }
}

const INPUT_FILES = 'inputFiles';
const OUTPUT_FILES = 'outputFiles';

const FileViewerNode: React.FC<FileViewerNodeProps> = (node) => {
  const selectFileRef = useRef<HTMLSelectElement>(null);
  const { getFiles, getDownloadInfo } = useMythicaApi();
  const { getFlowData, setFlowData } = useAwfulFlow();
  const [apiFiles, setApiFiles] = useState<GetFileResponse[]>([]);
  const [downloadInfo, setDownloadInfo] = useState<Array<GetDownloadInfoResponse | null>>([]);
  const [selectedPane, setSelectedPane] = useState(node.data.selectedPane || 0);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(node.data.selectedFileIds || []);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>(node.data.selectedFileNames || []);

  const [initialized, setInitialized] = useState(false);

  const inputFlowData = getFlowData(node.id)[INPUT_FILES] as GetFileResponse[];

  const fetchAvailableFiles = useCallback(async () => {
    try {
      const files = await getFiles();
      setApiFiles(files);
    } catch (error) {
      console.error('Error fetching available files:', error);
    }
  }, [getFiles]);

  const getDownloads = useCallback(
    async (files: Array<GetFileResponse | null>): Promise<Array<GetDownloadInfoResponse | null>> => {
      const dInfos: Array<GetDownloadInfoResponse | null> = [];
      for (const file of files) {
        try {
          if (!file) throw new Error();
          dInfos.push(await getDownloadInfo(file.file_id));
        } catch {
          dInfos.push(null);
        }
      }
      setFlowData(node.id, OUTPUT_FILES, files.filter((file)=>(file!==null)));
      return dInfos;
    },
    [getDownloadInfo, setFlowData, node.id]
  );
  
  const toggleFileSelector = () => {
    if (!showFileSelector) fetchAvailableFiles();
    else handleFileSelection();
    setShowFileSelector(!showFileSelector);
  }

  const setFileSelections = (file_ids: string[]) => {
    const selectCtl = selectFileRef.current;
    if (selectCtl) {
      for (let i = 0; i < selectCtl.options.length; i++) {
        const option = selectCtl.options.item(i);
        if (!option) continue;
        if (option.value in file_ids) {
          option.selected = true;
        } else {
          option.selected = false;
        }
      }
    }
  }

  const handleFileSelection = useCallback(
    () => {
      if (!selectFileRef) return;
      const filesById = new Map<string, GetFileResponse>();
      apiFiles.forEach((file)=>{
        if (file)
          filesById.set(file.file_id, file);
      });

      const selectedFiles = [];
      const options = selectFileRef.current?.selectedOptions;
      if (options && options.length > 0) {
        for(const option of options){
          const file = filesById.get(option.value);
          file && selectedFiles.push(file);
        }
      }

      const selectedNames = selectedFiles.map(file => file.file_name);
      const selectedIds = selectedFiles.map(file => file.file_id);
      
      setSelectedFileIds(selectedIds);
      setSelectedFileNames(selectedNames);
      
      setFlowData(node.id, INPUT_FILES, selectedFiles);
      //updateNodeInternals(node.id);
    },
    [apiFiles, setFlowData, node.id]
  );

  useEffect(() => {
    fetchAvailableFiles().then(() => {
      setFileSelections(selectedFileIds);
      setInitialized(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update node save data 
  useEffect(() => {
    if (initialized) {
      node.data.selectedPane = selectedPane;
      node.data.selectedFileIds = selectedFileIds;
      node.data.selectedFileNames = selectedFileNames;
    }
  }, [selectedPane, selectedFileIds, selectedFileNames, node, initialized]);

  //get download info for selected files whenever inputFlowData changes
  useEffect(() => {
    if (inputFlowData && inputFlowData.length > 0) {
      const selectedFiles = inputFlowData.filter(file => file !== null) as GetFileResponse[];
      setFileSelections(selectedFiles.map(file => file.file_id));
      const selectedNames = selectedFiles.map(file => file.file_name);
      const selectedIds = selectedFiles.map(file => file.file_id);
      
      setSelectedFileIds(selectedIds);
      setSelectedFileNames(selectedNames);
      
      getDownloads(inputFlowData).then((dInfos) => setDownloadInfo(dInfos));
    } 
  }, [inputFlowData, setDownloadInfo, getDownloads]); 


  const columnWidth = 200;
  const viewerWidth = 640; 
  const viewerHeight = 480; 
  const columnStyle = { width: columnWidth }
  const viewerStyle = { height: viewerHeight, width: viewerWidth }

  return (
    <div className={`mythica-node file-viewer-node ${node.selected && 'selected'}`}>
      
      <h3>File Viewer</h3>

      <div style={{ marginBottom: '10px' }} className='nodrag'>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            onClick={() => setShowFileSelector(!showFileSelector)}
            type="text"
            value={(selectedFileNames.length>1 ? 'Multiple Selections' : selectedFileNames.join(', ')) || 'Click to Select Files...'}
            readOnly
            style={{ 
              flex: 1,
              padding: '4px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={toggleFileSelector}
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
            className='nowheel'
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
            defaultValue={selectedFileIds}
          >
            {apiFiles.map((file) => (
              <option key={file.file_name + file.file_id} value={file.file_id}>
                {file.file_name || file.file_id}
              </option>
            )).sort((a, b) => (a?.key || -1) < (b?.key || 1) ? -1 : 1)}
          </select>
        )}
      </div>

      {/* Target handle for accepting incoming file ID connections */}
      <FileInputHandle
        id={INPUT_FILES}
        left="50%"
        isConnectable
        style={{ background: '#555' }}
        label="Inputs[ ]"/>

      {(!downloadInfo || downloadInfo.length === 0) ? (
        <div />
      ) : (
        <div className='nodrag nowheel folder-container'>
          <div style={{ display: 'flex', flexDirection: 'row' , height: '100%' }}>
            {/* Tab Navigation */}
            <div className="folder-tabs vertical" style={{...columnStyle, overflow:'clip'}}>
              {downloadInfo.map((fileInfo, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPane(index)}
                  className={`folder-tab ${(selectedPane === index) ? 'active' : ''}`}>
                  {fileInfo?.name || 'Error!'}
                </div>
              ))}
            </div>

            {/* Pane Content */}
            <div style={{ position: 'relative' }}>
              {downloadInfo.map((fileInfo, index) =>
                (
                  <div
                    className='folder-content'
                    key={index}
                    style={{
                      position: index === selectedPane ? 'relative' : 'absolute',
                      visibility: index === selectedPane ? 'visible' : 'hidden',
                      display: 'block', // Ensure the content is visible and takes up space
                    }}
                  >
                    <div style={{ }}>
                    {fileInfo ? (
                      <>
                        {fileInfo.content_type.startsWith('image/') ? (
                          <img
                            src={fileInfo.url}
                            alt={fileInfo.name}
                            style={viewerStyle}
                          />
                        ) : fileInfo.content_type === 'application/json' ||
                          fileInfo.content_type === 'application/awful' ? (
                          <CodeViewer 
                            style={viewerStyle}
                            language="json" 
                            fileUrl={fileInfo.url} />
                        ) : fileInfo.content_type === 'application/awjs' ? (
                          <CodeViewer 
                            style={viewerStyle}
                            language="javascript" 
                            fileUrl={fileInfo.url} />
                        ) : fileInfo.content_type === 'application/usd' ||
                          fileInfo.content_type === 'application/usdz' ? (
                          <USDViewer
                            src={fileInfo.url}
                            alt={fileInfo.name}
                            style={viewerStyle}
                          />
                        ) : (
                          <div 
                          style={{height:'100px'}}>
                            <p>Unsupported file type: {fileInfo.content_type}</p>
                            <a href={fileInfo.url} target='_blank' rel='noreferrer'>Download</a>
                          </div>
                        )}
                        
                      </>
                    ) : (
                      <p>Error loading file</p>
                    )}
                    </div>
                  </div>
                ) // Only render the selected pane
              )}
            </div>

          </div>
        </div>
      )}

      {/* Source handle for passing the file ID downstream */}
      <FileOutputHandle
        id={OUTPUT_FILES}
        left="50%"
        isConnectable
        style={{ background: '#555' }}
        label="Outputs[ ]"/>
      <p />
    </div>
  );
};

export default memo(FileViewerNode);


