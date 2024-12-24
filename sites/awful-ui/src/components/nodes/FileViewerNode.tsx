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
import {
  GetDownloadInfoResponse,
  GetFileResponse,
} from '../../types/MythicaApi';

import CodeViewer from './viewers/CodeViewer';
import FileInputHandle from '../handles/FileInputHandle';
import FileOutputHandle from '../handles/FileOutputHandle';
import { Card, Checkbox, Option, Select, Tabs, Typography } from '@mui/joy';
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
  const selectFileRef = useRef<HTMLSelectElement>(null);
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

  const inputFlowData = getFlowData(node.id)[INPUT_FILES] as GetFileResponse[];

  const fetchAvailableFiles = useCallback(async () => {
    if (!authToken) return;
    try {
      const files = await getFiles();
      setApiFiles(files);
    } catch (error) {
      console.error('Error fetching available files:', error);
    }
  }, [getFiles, authToken]);

  const getDownloads = useCallback(
    async (
      files: Array<GetFileResponse | null>
    ): Promise<Array<GetDownloadInfoResponse | null>> => {
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

  const handleFileSelection = useCallback(
    (options: string[]) => {
      if (!selectFileRef) return;
      const filesById = new Map<string, GetFileResponse>();
      apiFiles.forEach((file) => {
        if (file) filesById.set(file.file_id, file);
      });

      const selectedFiles: any[] = [];

      if (options && options.length > 0) {
        options.forEach((option) => {
          const file = filesById.get(option);

          file && selectedFiles.push(file);
        });
      }

      const selectedNames = selectedFiles.map((file) => file.file_name);
      const selectedIds = selectedFiles.map((file) => file.file_id);

      setSelectedFileIds(selectedIds);
      setSelectedFileNames(selectedNames);

      setFlowData(node.id, INPUT_FILES, selectedFiles);
      //updateNodeInternals(node.id);
    },
    [apiFiles, setFlowData, node.id]
  );

  useEffect(() => {
    fetchAvailableFiles().then(() => {
      setInitialized(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

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
      const selectedFiles = inputFlowData.filter(
        (file) => file !== null
      ) as GetFileResponse[];

      const selectedNames = selectedFiles.map((file) => file.file_name);
      const selectedIds = selectedFiles.map((file) => file.file_id);

      setSelectedFileIds(selectedIds);
      setSelectedFileNames(selectedNames);

      getDownloads(inputFlowData).then((dInfos) => setDownloadInfo(dInfos));
    }
  }, [inputFlowData, setDownloadInfo, getDownloads]);

  useLayoutEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        myFunction(entry.contentRect);
      }
    };

    const myFunction = (contentRect: DOMRectReadOnly) => {
      setViewerWidth(contentRect.width);
    };

    const observer = new ResizeObserver(handleResize);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const columnWidth = 200;
  const viewerHeight = 480;
  const columnStyle = { width: columnWidth };
  const viewerStyle = {
    height: viewerHeight,
    width: viewerWidth,
    maxWidth: 700,
  };

  useEffect(() => {
    if (
      selectedFileIds.length > 0 &&
      downloadInfo.length === 0 &&
      apiFiles.length > 0 &&
      selectFileRef &&
      !isRestoredFromLocalStorage
    ) {
      handleFileSelection(selectedFileIds);
      setIsRestoredFromLocalStorage(true);
      setSelectedPane(0);
    }
  }, [apiFiles, selectedFileIds, selectFileRef, downloadInfo]);

  return (
    <Card
      className={`mythica-node file-viewer-node ${node.selected && 'selected'}`}
      sx={{ minWidth: 400, height: '100%' }}
      ref={containerRef}
    >
      <NodeResizer minHeight={100} minWidth={300} />
      <Typography level="h4">File Viewer</Typography>

      <div style={{ marginBottom: '10px' }} className="nodrag">
        {/*@ts-expect-error*/}
        <Select
          className="nowheel"
          ref={selectFileRef}
          multiple
          onChange={(_, newValue) => {
            handleFileSelection(newValue);
          }}
          placeholder="Select..."
          style={{
            marginTop: '8px',
            padding: '5px',
            width: '100%',
          }}
          defaultValue={selectedFileIds}
        >
          {apiFiles
            .map((file) => {
              return (
                <Option
                  key={file.file_name + file.file_id}
                  value={file.file_id}
                >
                  <Checkbox checked={selectedFileIds.includes(file.file_id)} />
                  {file.file_name || file.file_id}
                </Option>
              );
            })
            .sort((a, b) => ((a?.key || -1) < (b?.key || 1) ? -1 : 1))}
        </Select>
      </div>

      {/* Target handle for accepting incoming file ID connections */}
      <FileInputHandle
        id={INPUT_FILES}
        left="50%"
        isConnectable
        style={{ background: '#555' }}
        label="Inputs[ ]"
      />

      {!downloadInfo || downloadInfo.length === 0 ? null : (
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
              {downloadInfo.map(
                (fileInfo, index) => (
                  <div
                    className="folder-content"
                    key={index}
                    style={{
                      position:
                        index === selectedPane ? 'relative' : 'absolute',
                      visibility: index === selectedPane ? 'visible' : 'hidden',
                      display: 'block', // Ensure the content is visible and takes up space
                    }}
                  >
                    <div style={{}}>
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
                              <p>
                                Unsupported file type: {fileInfo.content_type}
                              </p>
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
        label="Outputs[ ]"
      />
      <p />
    </Card>
  );
};

export default memo(FileViewerNode);
