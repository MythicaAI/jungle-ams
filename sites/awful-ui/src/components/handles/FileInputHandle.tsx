import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Typography } from '@mui/joy';

type FileInputHandleProps = {
  id: string;
  left: string;
  isConnectable: boolean;
  style: React.CSSProperties;
  label: string;
};

const FileInputHandle: React.FC<FileInputHandleProps> = (
  prop: FileInputHandleProps
) => {
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
