import React, { useState } from 'react';
import { Box, SxProps, Typography, Button } from '@mui/joy';
import { useSceneStore } from "scenetalk";
import { LucideChevronUp, LucideChevronDown } from "lucide-react";

interface StatusBarProps {
  children?: React.ReactNode;
  sx?: SxProps;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  sx,
}) => {
  const [isLogVisible, setIsLogVisible] = useState(false);
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
        justifyContent: 'space-between',
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
      
      <Button
        color="neutral"
        variant="plain"
        onClick={() => setIsLogVisible(!isLogVisible)}
        sx={{ 
          minWidth: '32px',
          width: '32px',
          height: '24px',
          padding: 0,
          ml: 1
        }}
      >
        {isLogVisible ? 
          <LucideChevronDown height="16px" width="16px" /> : 
          <LucideChevronUp height="16px" width="16px" />
        }
      </Button>

      {/* Log panel as a dropdown from the button */}
      {isLogVisible && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '31px',  // Position just above the status bar
            right: '12px',   // Position aligned with the right padding
            width: '400px',
            height: '300px',
            backgroundColor: 'background.surface',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '4px 4px 0 0',
            padding: '8px',
            boxShadow: 'sm',
            zIndex: 101,
            overflowY: 'auto'
          }}
        >
          {statusLog.length > 0 ? (
            statusLog.map((log, index) => (
              <Typography key={index} level="body-sm" sx={{ py: 0.5 }}>
                {log}
              </Typography>
            ))
          ) : (
            <Typography level="body-sm">No log messages</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};