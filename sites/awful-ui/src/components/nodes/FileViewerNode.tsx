import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  memo,
} from 'react';

import useMythicaApi from '../../hooks/useMythicaApi';
import useAwfulFlow from '../../hooks/useAwfulFlow';

import USDViewer from './viewers/USDViewer';
import CodeViewer from './viewers/CodeViewer';
import FileInputHandle from '../handles/FileInputHandle';
import FileOutputHandle from '../handles/FileOutputHandle';

import { Card, Typography, Tabs } from '@mui/joy';
import {
  GetDownloadInfoResponse,
  GetFileResponse,
} from '../../types/MythicaApi';

import FilePickerModal from '../utils/FilePickerModal'; // <-- The new component

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
  const [viewerWidth, setViewerWidth] = useState<number | undefined>();
  const { getFiles, getDownloadInfo, authToken } = useMythicaApi();
  const { getFlowData, setFlowData, NodeResizer } = useAwfulFlow();

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
      setFlowData(
        node.id,
        OUTPUT_FILES,
        files.filter((file) => file !== null)
      );
      return dInfos;
    },
    [getDownloadInfo, setFlowData, node.id]
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

      setSelectedFileIds(selectedIds);
      setSelectedFileNames(selectedNames);

      getDownloads(inputFlowData).then((dInfos) => setDownloadInfo(dInfos));
    }
  }, [inputFlowData, getDownloads]);

  // Watch for container resize
  useLayoutEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setViewerWidth(entry.contentRect.width);
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  // On first render, if we already have file IDs but no downloadInfo, restore them
  useEffect(() => {
    if (
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
  const viewerHeight = 480;
  const columnStyle = { width: columnWidth };
  const viewerStyle = {
    height: viewerHeight,
    width: viewerWidth,
    maxWidth: 700,
  };


  return (
    <Card
      className={`mythica-node file-viewer-node ${node.selected && 'selected'}`}
      sx={{ minWidth: 400, height: '100%' }}
      ref={containerRef}
    >
      <NodeResizer minHeight={100} minWidth={300} />
      <Typography level="h4">File Viewer</Typography>

      {/* The "Select Files" button now opens our new FilePickerModal */}
      <div style={{ marginBottom: '10px' }} className="nodrag">
        <button onClick={() => setIsPickerOpen(true)}>Select Files</button>
      </div>

      {/* Our new FilePickerModal for searching / selecting multiple files */}
      <FilePickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSave={(newSelectedFileIds: string[]) => handleFileSelection(newSelectedFileIds)}
        selectedFileIds={selectedFileIds}
        files={apiFiles}
        label="Choose Your Files"
      />

      {/* Input handle */}
      <FileInputHandle
        id={INPUT_FILES}
        left="50%"
        isConnectable
        style={{ background: '#555' }}
        label="Inputs[ ]"
      />

      {/* If we have download info, render the tab/pane viewer */}
      {downloadInfo && downloadInfo.length > 0 && (
        <div className="nodrag nowheel folder-container">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Tab Navigation */}
            <Tabs
              className="folder-tabs vertical"
              sx={{ minWidth: 200 }}
              style={{ ...columnStyle, overflow: 'clip' }}
            >
              {downloadInfo.map((fileInfo, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPane(index)}
                  className={`folder-tab ${
                    selectedPane === index ? 'active' : ''
                  }`}
                >
                  {fileInfo?.name || 'Error!'}
                </div>
              ))}
            </Tabs>

            {/* Pane Content */}
            <div style={{ position: 'relative', width: '90%' }}>
              {downloadInfo.map((fileInfo, index) => (
                <div
                  className="folder-content"
                  key={index}
                  style={{
                    position: index === selectedPane ? 'relative' : 'absolute',
                    visibility: index === selectedPane ? 'visible' : 'hidden',
                    display: 'block',
                  }}
                >
                  <div>
                    {fileInfo ? (
                      <>
                        {fileInfo.content_type.startsWith('image/') ? (
                          <img
                            src={fileInfo.url}
                            alt={fileInfo.name}
                            style={viewerStyle}
                          />
                        ) : fileInfo.content_type === 'application/json' ||
                          fileInfo.content_type === 'application/awpy' ||
                          fileInfo.content_type === 'application/awful' ? (
                          <CodeViewer
                            style={viewerStyle}
                            language="json"
                            fileUrl={fileInfo.url}
                          />
                        ) : fileInfo.content_type === 'application/awjs' ? (
                          <CodeViewer
                            style={viewerStyle}
                            language="javascript"
                            fileUrl={fileInfo.url}
                          />
                        ) : fileInfo.content_type === 'application/usd' ||
                          fileInfo.content_type === 'application/usdz' ? (
                          <USDViewer
                            src={fileInfo.url}
                            alt={fileInfo.name}
                            style={viewerStyle}
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Output handle */}
      <FileOutputHandle
        id={OUTPUT_FILES}
        left="50%"
        isConnectable
        style={{ background: '#555' }}
        label="Outputs[ ]"
      />
    </Card>
  );
};

export default memo(FileViewerNode);
