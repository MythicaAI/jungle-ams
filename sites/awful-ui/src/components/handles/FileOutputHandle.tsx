import React, { useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Typography } from '@mui/joy';
import useAwfulFlow from '../../hooks/useAwfulFlow';

type FileOutputHandleProps = {
  id: string;
  nodeId: string;
  left: string;
  isConnectable: boolean;
  style: React.CSSProperties;
  label: string;
};


const FileOutputHandle: React.FC<FileOutputHandleProps> = (
  prop: FileOutputHandleProps
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
        bottom: '0px',
        left: prop.left,
        transform: 'translateX(-50%)',
      }}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        id={prop.id}
        isConnectable={prop.isConnectable}
        style={{ background: '#007bff', ...prop.style }}
      />
      <Typography className="label" fontWeight={500}>
        {prop.label}
      </Typography>
    </div>
  );
};

export default FileOutputHandle;
