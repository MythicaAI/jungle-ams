import React, { useEffect, useState } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps, EdgeLabelRenderer } from '@xyflow/react';
import { GetFileResponse } from '../../types/MythicaApi';
import useAwfulFlow from '../../hooks/useAwfulFlow';

type FileEdgeProps = EdgeProps & {
  data: {
    files: GetFileResponse[];
  };
};

export const FileEdge: React.FC<FileEdgeProps> = (edge: FileEdgeProps) => {
  const { getFlowData, setFlowData } = useAwfulFlow();
  const myFlowData = getFlowData(edge.source)[edge.sourceHandleId as string];

  // State for selected file and dropdown open/close status.
  const [selectedFile, setSelectedFile] = useState<GetFileResponse>();
  const [isOpen, setIsOpen] = useState(false);

  // Toggle dropdown open/close.
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // Handle selecting a file option.
  const handleFileSelect = (fileId: string) => {
    const file = myFlowData.find(file => file.file_id === fileId);
    if (!file) {
      return;
    }
    setSelectedFile(file);
    setIsOpen(false);
  };

  useEffect(() => {
    // Set the selected file to the first file in the list if none is selected.
    if (selectedFile) {
      setFlowData(edge.target, edge.targetHandleId as string, [selectedFile]);
    }
  }, [selectedFile, setFlowData]);

  useEffect(() => {
    setSelectedFile(undefined);
  },[myFlowData])
  // Determine the display name for the selected file.
  const selectedFileName = myFlowData?.find(file => file.file_id === selectedFile?.file_id)?.file_name;

  const [edgePath] = getBezierPath({
    sourceX: edge.sourceX,
    sourceY: edge.sourceY,
    sourcePosition: edge.sourcePosition,
    targetX: edge.targetX,
    targetY: edge.targetY,
    targetPosition: edge.targetPosition,
  });

  return (
    <>
      <BaseEdge id={edge.id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            transform: `translate(0%,-100%) translate(${edge.targetX}px,${edge.targetY}px)`,
            position: 'relative',
          }}
        >
          {/* The twisty and label */}
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            {/* The twisty icon: right-pointing when closed, down-pointing when open */}
            <span onClick={toggleDropdown} style={{ fontSize: '30px', marginRight: '8px',  marginLeft: '`15px', pointerEvents: 'all' }}>
              {isOpen ? '▲' : '▼'}
            </span>
            {/* Display the selected file name or a placeholder */}
            {selectedFile ? (
              <span style={{visibility:isOpen?'hidden':'visible'}}>{selectedFileName}</span>
            ) : (
              ''
            )}

          </div>

          {/* Dropdown list of file options */}
          {isOpen && (
            <ul
              style={{
              listStyle: 'none',
              margin: 0,
              padding: '5px',
              border: '1px solid #ccc',
              position: 'absolute',
              bottom: '100%',
              backgroundColor: 'rgba(64, 64, 64, 0.5)',
              left: 0,
              zIndex: '1000 !important',
              width: '100%',
              }}
            >
              {myFlowData.map(file => (
              <li
                key={file.file_id}
                onClick={() => handleFileSelect(file.file_id)}
                style={{ padding: '5px', cursor: 'pointer', pointerEvents: 'all' }}
              >
                {file.file_name}
              </li>
              ))}
            </ul>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
