import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/joy';
import { useSceneStore } from "scenetalk";
import { LucideChevronUp, LucideChevronDown } from "lucide-react";

interface StatusBarProps {
  children?: React.ReactNode;
}

export const StatusBar: React.FC<StatusBarProps> = () => {
  const [isLogVisible, setIsLogVisible] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const { 
    wsStatus, 
    statusLog 
  } = useSceneStore();
  
  useEffect(() => {
    if (isLogVisible && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [isLogVisible]);
  
  // Get the latest log message if available
  const latestLogMessage = statusLog.length > 0 ? statusLog[statusLog.length - 1] : '';

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1e1e1e',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        height: '40px',
        zIndex: 100
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        flex: 1,
      }}>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: wsStatus === "connected" 
              ? 'rgba(80, 80, 80, 0.15)' 
              : wsStatus === "reconnecting" 
                ? 'rgba(255, 165, 0, 1.0)' 
                : 'rgba(244, 67, 54, 1.0)',
            padding: '0 8px',
            height: '100%',
            color: wsStatus === "connected" 
              ? 'inherit' 
              : '#000000',
            fontWeight: 'bold',
          }}
        >
          <Box 
            sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              bgcolor: wsStatus === "connected" 
                ? 'success.500' 
                : wsStatus === "reconnecting" 
                  ? 'warning.500' 
                  : 'danger.500',
              display: 'inline-block'
            }} 
          />
          {wsStatus === "connected" 
            ? "Connected" 
            : wsStatus === "reconnecting" 
              ? "Reconnecting..." 
              : "Disconnected"}
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(95, 95, 95, 0.25)',
            padding: '0 8px',
            height: '100%',
            flex: 1,
            justifyContent: 'flex-start',
          }}
        >
          <Typography 
            component="span" 
            sx={{ 
              flex: 1, 
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: '400px',
              display: 'inline-block',
              textAlign: 'left'
            }}
          >
            {latestLogMessage}
          </Typography>
        </Box>
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
          ref={logContainerRef}
          sx={{
            position: 'absolute',
            bottom: '41px',
            right: '0px',
            width: '500px',
            height: '300px',
            backgroundColor: '#1e1e1e',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '4px 4px 0 0',
            padding: '8px',
            boxShadow: 'sm',
            zIndex: 101,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {(() => {
            // Create shared log message typography styling
            const logTypographyStyle = {
              textAlign: 'left',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.9rem',
              lineHeight: 1.4,
              letterSpacing: '0.015em',
              color: '#e0e0e0'
            };

            return statusLog.length > 0 ? (
              statusLog.map((log, index) => (
                <Typography key={index} level="body-sm" sx={{ 
                  py: 0.25,
                  ...logTypographyStyle
                }}>
                  {log}
                </Typography>
              ))
            ) : (
              <Typography level="body-sm" sx={logTypographyStyle}>
                No log messages
              </Typography>
            );
          })()}
        </Box>
      )}
    </Box>
  );
};