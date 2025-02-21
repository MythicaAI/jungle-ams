import React, { useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Typography } from '@mui/joy';
import useAwfulFlow from '../../hooks/useAwfulFlow';

type FileInputHandleProps = {
  id: string;
  nodeId: string;
  left: string;
  isConnectable: boolean;
  style: React.CSSProperties;
  label: string;
};

const FileInputHandle: React.FC<FileInputHandleProps> = (
  prop: FileInputHandleProps
) => {
  const { onRemoveHandle } = useAwfulFlow();
  const didMount = useRef(false);

  useEffect(() => {
    return () => {
      // Only call onRemoveHandle if we’re past the initial mount.
      if (didMount.current) {
        onRemoveHandle(prop.nodeId, prop.id);
      }
      // Mark that we have mounted.
      didMount.current = true;
    };
  }, []);
  

  return (
    <div
      className="file-handle"
      style={{
        top: '0px',
        left: prop.left,
        transform: 'translateX(-50%)',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id={prop.id}
        isConnectable={prop.isConnectable}
        style={{ background: '#007bff', ...prop.style }}
      />
      <Typography mt="7px" className="label" fontWeight={600}>
        {prop.label}
      </Typography>
    </div>
  );
};

export default FileInputHandle;
