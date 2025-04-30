import React from 'react';
import { Box, SxProps, Typography } from '@mui/joy';
import { useSceneStore } from "scenetalk";

interface StatusBarProps {
  children?: React.ReactNode;
  sx?: SxProps;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  sx,
}) => {
  const { 
    wsStatus, 
    statusLog 
  } = useSceneStore();
  
  // Get the latest log message if available
  const latestLogMessage = statusLog.length > 0 ? statusLog[statusLog.length - 1] : '';

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '4px 12px',
        backgroundColor: 'background.surface',
        borderTop: '1px solid',
        borderColor: 'divider',
        fontSize: '0.85rem',
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        height: '30px',
        zIndex: 100,
        ...sx
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1 
      }}>
        <Box 
          sx={{ 
            width: 10, 
            height: 10, 
            borderRadius: '50%', 
            bgcolor: wsStatus === "connected" ? 'success.500' : 'warning.500',
            display: 'inline-block'
          }} 
        />
        {wsStatus === "connected" ? "Connected" : "Reconnecting..."}
        {latestLogMessage && (
          <>
            {" | "}
            <Typography 
              component="span" 
              sx={{ 
                flex: 1, 
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                maxWidth: '400px',
                display: 'inline-block'
              }}
            >
              {latestLogMessage}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};