import React from 'react';
import { Box } from '@mui/joy';
import { LucideGripVertical } from 'lucide-react';

export const NodeHeader: React.FC = () => {
  return (
    <Box
      className="drag-panel"
      sx={{
        position: 'absolute',
        height: '40px',
        width: '100%',
        background: '#24292e',
        top: 0,
        left: 0,
        borderTopLeftRadius: '7px',
        borderTopRightRadius: '7px',
        zIndex: 0,
      }}
    >
      <Box sx={{ left: '7px', top: '8px', position: 'relative' }}>
        <LucideGripVertical />
      </Box>
    </Box>
  );
};
