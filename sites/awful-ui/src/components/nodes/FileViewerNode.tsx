import React,
{ useState, useEffect, useRef, useCallback, memo } from 'react';

import Split from 'react-split';

import useMythicaApi from '../../hooks/useMythicaApi';
import useAwfulFlow from '../../hooks/useAwfulFlow';

import CodeViewer from './viewers/CodeViewer';
import FileInputHandle from '../handles/FileInputHandle';
import FileOutputHandle from '../handles/FileOutputHandle';

import { Typography, Tabs, Box, Button } from '@mui/joy';
import {
  GetDownloadInfoResponse,
  GetFileResponse,
} from '../../types/MythicaApi';

import FilePickerModal from '../ux/FilePickerModal'; // <-- The new component

import { useReactFlow } from '@xyflow/react';
import { NodeDeleteButton } from './ux/NodeDeleteButton';
import { NodeHeader } from './ux/NodeHeader';
import BabylonViewer from './viewers/BabylonViewer';
import O3dViewer from './viewers/O3dViewer';
interface FileViewerNodeProps {
  id: string;
  selected?: boolean;
  data: {
    selectedPane: number;
    selectedFileIds: string[];
    selectedFileNames: string[];
  };
}

const INPUT_FILES = 'inputFiles';
const OUTPUT_FILES = 'outputFiles';

const FileViewerNode: React.FC<FileViewerNodeProps> = (node) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { getFiles, getDownloadInfo, authToken } = useMythicaApi();
  const { getFlowData, setFlowData, NodeResizer } = useAwfulFlow();
  const { deleteElements } = useReactFlow();
  const [apiFiles, setApiFiles] = useState<GetFileResponse[]>([]);
  const [downloadInfo, setDownloadInfo] = useState<
    Array<GetDownloadInfoResponse | null>
  >([]);
  const [isRestoredFromLocalStorage, setIsRestoredFromLocalStorage] =
    useState(false);
  const [selectedPane, setSelectedPane] = useState(node.data.selectedPane || 0);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(
    node.data.selectedFileIds || []
  );
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>(
    node.data.selectedFileNames || []
  );
  const [initialized, setInitialized] = useState(false);

  // New state to control whether our FilePickerModal is open
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const inputFlowData = getFlowData(node.id)[INPUT_FILES] as GetFileResponse[];

  /**
   * Fetch available files
   */
  const fetchAvailableFiles = useCallback(async () => {
    if (!authToken) return;
    try {
      const files = await getFiles();
      setApiFiles(files);
    } catch (error) {
      console.error('Error fetching available files:', error);
    }
  }, [getFiles, authToken]);

  /**
   * Retrieve the download info for a list of files
   */
  const getDownloads = useCallback(
    async (files: Array<GetFileResponse | null>) => {
      const dInfos: Array<GetDownloadInfoResponse | null> = [];
      for (const file of files) {
        try {
          if (!file) throw new Error();
          dInfos.push(await getDownloadInfo(file.file_id));
        } catch {
          dInfos.push(null);
        }
      }

      return dInfos;
    },
    [getDownloadInfo]
  );

  /**
   * Called when the user finalizes their file selection in the modal.
   * Maps the IDs -> real files -> updates node state & flow data.
   */
  const handleFileSelection = useCallback(
    (newSelectedFileIds: string[]) => {
      // Make a quick map of ID -> file
      const filesById = new Map<string, GetFileResponse>();
      apiFiles.forEach((file) => filesById.set(file.file_id, file));

      const selectedFiles: GetFileResponse[] = [];
      if (newSelectedFileIds && newSelectedFileIds.length > 0) {
        newSelectedFileIds.forEach((fid) => {
          const file = filesById.get(fid);
          if (file) selectedFiles.push(file);
        });
      }

      const selectedNames = selectedFiles.map((f) => f.file_name);
      const selectedIds = selectedFiles.map((f) => f.file_id);

      setSelectedFileIds(selectedIds);
      setSelectedFileNames(selectedNames);

      // Provide them to the flow
      setFlowData(node.id, INPUT_FILES, selectedFiles);

      // Close the modal (if open)
      setIsPickerOpen(false);
    },
    [apiFiles, setFlowData, node.id]
  );

  // On mount, fetch files
  useEffect(() => {
    fetchAvailableFiles().then(() => setInitialized(true));
  }, [fetchAvailableFiles]);

  // Keep node.data in sync
  useEffect(() => {
    if (initialized) {
      node.data.selectedPane = selectedPane;
      node.data.selectedFileIds = selectedFileIds;
      node.data.selectedFileNames = selectedFileNames;
    }
  }, [initialized, selectedPane, selectedFileIds, selectedFileNames, node]);

  // If the inputFlowData changes, update our selection & get the download info
  useEffect(() => {
    if (inputFlowData) {
      const selectedFiles = inputFlowData.filter(
        (file) => file !== null
      ) as GetFileResponse[];
      const selectedNames = selectedFiles.map((file) => file.file_name);
      const selectedIds = selectedFiles.map((file) => file.file_id);

      setSelectedFileIds(() => 
        selectedIds
      );

      setSelectedFileNames(selectedNames);

      getDownloads(inputFlowData).then((dInfos) => setDownloadInfo(dInfos));
      setFlowData(
        node.id,
        OUTPUT_FILES,
        inputFlowData.filter((file) => file !== null)
      );
    }
  }, [inputFlowData, getDownloads]);

  // Watch for container resize
 
  // On first render, if we already have file IDs but no downloadInfo, restore them
  useEffect(() => {
    if (
      !inputFlowData &&
      selectedFileIds.length > 0 &&
      downloadInfo.length === 0 &&
      apiFiles.length > 0 &&
      !isRestoredFromLocalStorage
    ) {
      handleFileSelection(selectedFileIds);
      setIsRestoredFromLocalStorage(true);
      setSelectedPane(0);
    }
  }, [
    apiFiles,
    selectedFileIds,
    downloadInfo,
    isRestoredFromLocalStorage,
    handleFileSelection,
  ]);

  const columnWidth = 200;
  //const viewerHeight = 480;
  const columnStyle = { width: columnWidth };

  return (
    <div
      className={`mythica-node file-viewer-node ${node.selected && 'selected'}`}
      ref={containerRef}
    >
      <NodeDeleteButton
        onDelete={() => {
          deleteElements({ nodes: [node] });
        }}
      />
      <NodeHeader />
      {/* Input handle */}
      <FileInputHandle
        nodeId={node.id}
        id={INPUT_FILES}
        left="50%"
        isConnectable
        style={{ background: '#555' }}
        label="Inputs[ ]"
      />

      <NodeResizer minHeight={100} minWidth={300} />
      <Typography level="h4">File Viewer</Typography>

      {/* The "Select Files" button now opens our new FilePickerModal */}
      <Box mt="20px" mb="20px" className="nodrag">
        <Button variant="outlined" onClick={() => setIsPickerOpen(true)}>
          Select Files
        </Button>
      </Box>

      {/* Our new FilePickerModal for searching / selecting multiple files */}
      <FilePickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSave={(newSelectedFileIds: string[]) =>
          handleFileSelection(newSelectedFileIds)
        }
        selectedFileIds={selectedFileIds}
        files={apiFiles}
        label="Choose Your Files"
      />

      {/* If we have download info, render the tab/pane viewer */}
      {downloadInfo && downloadInfo.length > 0 && (
        <div
          className="nodrag nowheel folder-container"
          style={{ flex: '1 1 0', height: '100%' }}
        >
          <Split
            sizes={[20, 80]}
            minSize={[0, 100]}
            expandToMin={false}
            gutterSize={5}
            gutterAlign="center"
            direction="horizontal"
            style={{
              display: 'flex',
              flexDirection: 'row',
              height: '100%',
              width: '100%',
            }}
          >
            {/* Tab Navigation */}
            <Tabs
              className="folder-tabs vertical"
              style={{ ...columnStyle, overflow: 'clip' }}
            >
              {downloadInfo.map((fileInfo, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPane(index)}
                  className={`folder-tab ${
                    selectedPane === index ? 'active' : ''
                  }`}
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fileInfo?.name || 'Error!'}
                </div>
              ))}
            </Tabs>

            {/* Pane Content */}
            <div style={{ position: 'relative', width: '90%', height: '100%' }}>
              {downloadInfo.map((fileInfo, index) => (
                <div
                  className="folder-content"
                  key={index}
                  style={{
                    position: index === selectedPane ? 'relative' : 'absolute',
                    visibility: index === selectedPane ? 'visible' : 'hidden',
                    display: 'block',
                    height: '100%',
                  }}
                >
                  {fileInfo ? (
                    <>
                      {[
                        'jpeg',
                        'jpg',
                        'png',
                        'gif',
                        'webp',
                        'svg',
                        'svg+xml',
                        'bmp',
                        'avif',
                      ].includes(fileInfo.content_type.split('/')[1]) ? (
                        <img
                          src={fileInfo.url}
                          alt={fileInfo.name}
                          style={{
                            height: '100%',
                            width: '100%',
                          }}
                        />
                      ) : fileInfo.content_type === 'application/json' ||
                        fileInfo.content_type === 'application/awpy' ||
                        fileInfo.content_type === 'application/awful' ? (
                        <CodeViewer
                          style={{
                            height: '100%',
                            width: '100%',
                          }}
                          language="json"
                          fileUrl={fileInfo.url}
                        />
                      ) : fileInfo.content_type === 'application/awjs' ? (
                        <CodeViewer
                          style={{
                            height: '100%',
                            width: '100%',
                          }}
                          language="javascript"
                          fileUrl={fileInfo.url}
                        />
                      ) : fileInfo.content_type === 'application/txt' ? (
                      <CodeViewer
                        style={{
                          height: '100%',
                          width: '100%',
                        }}
                        language="txt"
                        fileUrl={fileInfo.url}
                      />
                      ) : [
                          '3dm',
                          '3ds',
                          '3mf',
                          'amf',
                          'bim',
                          'brep',
                          'dae',
                          'fbx',
                          'fcstd',
                          'ifc',
                          'iges',
                          'step',
                          'stl',
                          'obj',
                          'off',
                          'ply',
                          'wrl'
                      ].includes(fileInfo.content_type.split('/')[1]) ? (
                        <O3dViewer
                          model={[fileInfo.url]}
                          style={{
                            height: '100%',
                            width: '100%',
                            minHeight: '480px',
                            minWidth: '640px',
                          }}
                        />
                      ) : fileInfo.content_type === 'application/gltf' ||
                        fileInfo.content_type === 'application/glb' ? (
                        <BabylonViewer
                          src={fileInfo.url}
                          style={{
                            height: '100%',
                            width: '100%',
                            minHeight: '480px',
                            minWidth: '640px',
                          }}
                        />
                      ) : (
                        <div style={{ height: '100px' }}>
                          <p>Unsupported file type: {fileInfo.content_type}</p>
                          <a
                            href={fileInfo.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>Error loading file</p>
                  )}
                </div>
              ))}
            </div>
          </Split>
        </div>
      )}
      <div style={{ height: '24px' }} />

      {/* Output handle */}
      <FileOutputHandle
        nodeId={node.id}
        id={OUTPUT_FILES}
        left="50%"
        isConnectable
        style={{ background: '#555' }}
        label="Outputs[ ]"
      />
    </div>
  );
};

export default memo(FileViewerNode);
