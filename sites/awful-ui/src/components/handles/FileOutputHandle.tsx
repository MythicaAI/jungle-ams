import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Typography } from '@mui/joy';

type FileOutputHandleProps = {
  id: string;
  left: string;
  isConnectable: boolean;
  style: React.CSSProperties;
  label: string;
};

const FileOutputHandle: React.FC<FileOutputHandleProps> = (
  prop: FileOutputHandleProps
) => {
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
