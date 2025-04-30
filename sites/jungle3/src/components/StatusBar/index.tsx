import React from 'react';
import { Box, SxProps, Typography } from '@mui/joy';

interface StatusBarProps {
  children?: React.ReactNode;
  sx?: SxProps;
  wsStatus?: 'connected' | 'disconnected' | 'reconnecting';
  requestInFlight?: boolean;
  selectedOperation?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  sx,
  wsStatus = 'disconnected',
  requestInFlight = false,
  selectedOperation = '',
}) => {
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
        height: '28px',
        zIndex: 100,
        ...sx
      }}
    >
      {(
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
          {wsStatus === "connected" && requestInFlight && (
            <>
              {" | "}
              <Typography component="span" sx={{ color: 'primary.500' }}>
                Cooking Op: {selectedOperation || ''}
              </Typography>
            </>
          )}
          {wsStatus === "connected" && !requestInFlight && " | Ready"}
        </Box>
      )}
    </Box>
  );
};