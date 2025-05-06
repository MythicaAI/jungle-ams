import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Dropdown, Menu, MenuButton, MenuItem, CircularProgress } from '@mui/joy';
import { useSceneStore } from "scenetalk";
import { LucideChevronUp, LucideChevronDown, LucideAlertTriangle, LucideAlertCircle, LucideDownload } from "lucide-react";

interface StatusBarProps {
  children?: React.ReactNode;
}

export const StatusBar: React.FC<StatusBarProps> = () => {
  const [isLogVisible, setIsLogVisible] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const { 
    wsStatus, 
    statusLog,
    setExportFormat,
    requestInFlight
  } = useSceneStore();
  
  useEffect(() => {
    if (isLogVisible && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [isLogVisible, statusLog]);
  
  const warningCount = statusLog.filter(log => log.level === "warning").length;
  const errorCount = statusLog.filter(log => log.level === "error").length;
  const latestLogMessage = statusLog.length > 0 ? statusLog[statusLog.length - 1] : { level: "info", log: "" };
  
  let primaryColor = "";
  let primaryHoverColor = "";
  let primaryTextColor = "";
  let secondaryColor = "";
  let secondaryTextColor = "";
  if (wsStatus === "disconnected" || latestLogMessage.level === "error") {
    primaryColor = "rgba(244, 67, 54, 0.5)";
    primaryTextColor = "rgb(255, 255, 255)";
    primaryHoverColor = "rgba(244, 67, 54, 0.6)";
    secondaryColor = "rgba(244, 67, 54, 0.7)";
    secondaryTextColor = "rgb(255, 255, 255)";
  }
  else if (latestLogMessage.level === "warning") {
    primaryColor = "rgba(255, 165, 0, 0.6)";
    primaryTextColor = "rgb(255, 255, 255)";
    primaryHoverColor = "rgba(255, 165, 0, 0.7)";
    secondaryColor = "rgba(255, 165, 0, 0.8)";
    secondaryTextColor = "rgb(255, 255, 255)";
  }
  else {
    primaryColor = "rgba(95, 95, 95, 0.2)";
    primaryTextColor = "rgb(255, 255, 255)";
    primaryHoverColor = "rgba(95, 95, 95, 0.5)";
    secondaryColor = "rgba(95, 95, 95, 0.3)";
    secondaryTextColor = "rgb(255, 255, 255)";
  }

  const canDownload = wsStatus === "connected" && latestLogMessage.level !== "error" && !requestInFlight;

  const handleDownload = (format: string) => {
    setExportFormat(format.toLowerCase());
  };

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
            backgroundColor: primaryColor,
            padding: '0 8px',
            height: '100%',
            color: primaryTextColor,
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
            backgroundColor: secondaryColor,
            padding: '0 8px',
            height: '100%',
            flex: 1,
            justifyContent: 'flex-start',
            overflow: 'hidden',
            width: 0,
          }}
        >
          {requestInFlight && latestLogMessage.log && (
            <CircularProgress 
              color="neutral"
              sx={{
                mr: 1,
                color: secondaryTextColor,
                "--CircularProgress-size": "20px",
                "--CircularProgress-trackThickness": "4px", 
                "--CircularProgress-progressThickness": "4px"
              }}
            />
          )}
          <Typography 
            component="span" 
            noWrap
            sx={{ 
              textOverflow: 'ellipsis',
              textAlign: 'left',
              color: secondaryTextColor
            }}
          >
            {latestLogMessage.log}
          </Typography>
        </Box>
      </Box>
      
      {/* Log toggle button with indicators */}
      <Button
        color="neutral"
        variant="plain"
        onClick={() => setIsLogVisible(!isLogVisible)}
        sx={{ 
          minWidth: 'auto',
          height: '100%',
          padding: '0 8px',
          borderRadius: '0px',
          '&:hover': { 
            bgcolor: primaryHoverColor,
          },
          backgroundColor: primaryColor,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          outline: 'none',
          outlineOffset: 0,
          '&:focus': {
            outline: 'none',
            boxShadow: 'none',
            outlineOffset: 0
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: 'none',
            outlineOffset: 0
          },
          '&::after': {
            content: 'none'
          }
        }}
      >
        {warningCount > 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
          }}>
            <LucideAlertTriangle size={16} color="#ffb84d" />
            {warningCount}
          </Box>
        )}
        {errorCount > 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
          }}>
            <LucideAlertCircle size={16} color="#ff4d4d" />
            {errorCount}
          </Box>
        )}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}>
          {isLogVisible ? 
            <LucideChevronDown height="16px" width="16px" /> : 
            <LucideChevronUp height="16px" width="16px" />
          }
        </Box>
      </Button>

      {/* Download Format Combo Button */}
      <Dropdown>
        <MenuButton
          slots={{ root: Button }}
          slotProps={{
            root: {
              variant: "solid",
              color: "neutral",
              disabled: !canDownload,
              sx: {
                height: '100%',
                borderRadius: '0px',
                bgcolor: 'rgba(0, 143, 31, 1.0)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': { 
                  bgcolor: 'rgba(0, 143, 31, 0.75)'
                },
                '&.Mui-disabled': {
                  opacity: 0.6,
                  color: 'rgba(255, 255, 255, 0.7)',
                  bgcolor: secondaryColor
                },
                outline: 'none',
                outlineOffset: 0,
                '&:focus': {
                  outline: 'none',
                  boxShadow: 'none',
                  outlineOffset: 0
                },
                '&:focus-visible': {
                  outline: 'none',
                  boxShadow: 'none',
                  outlineOffset: 0
                },
                '&::after': {
                  content: 'none'
                }
              }
            }
          }}
        >
          <LucideDownload size={16} />
          Download
        </MenuButton>
        <Menu>
          <MenuItem onClick={() => handleDownload('FBX')}>
            <LucideDownload size={14} />
            FBX
          </MenuItem>
          <MenuItem onClick={() => handleDownload('OBJ')}>
            <LucideDownload size={14} />
            OBJ
          </MenuItem>
          <MenuItem onClick={() => handleDownload('GLB')}>
            <LucideDownload size={14} />
            GLB
          </MenuItem>
          <MenuItem onClick={() => handleDownload('USD')}>
            <LucideDownload size={14} />
            USD
          </MenuItem>
        </Menu>
      </Dropdown>

      {/* Log panel as a dropdown from the button */}
      {isLogVisible && (
        <Box
          ref={logContainerRef}
          sx={{
            position: 'absolute',
            bottom: '41px',
            right: '0px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '250px',
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
              whiteSpace: 'nowrap'
            };

            const getLogColor = (level: string) => {
              switch(level.toLowerCase()) {
                case 'error': return '#ff4d4d';
                case 'warning': return '#ffb84d'; 
                case 'info': return '#bbbbbb';
                default: return '#bbbbbb';
              }
            };

            return statusLog.length > 0 ? (
              statusLog.map((log, index) => (
                <Typography key={index} level="body-sm" sx={{ 
                  py: 0.25,
                  ...logTypographyStyle,
                  color: getLogColor(log.level)
                }}>
                  {"[" + log.level + "] " + log.log}
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