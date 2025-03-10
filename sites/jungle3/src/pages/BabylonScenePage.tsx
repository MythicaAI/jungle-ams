import { useEffect, useState, useRef } from "react";
import { Box, CircularProgress } from "@mui/joy";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import SceneViewer from "@components/BabylonViewer/SceneViewer.tsx"
import SceneControls from "@components/BabylonViewer/SceneControls.tsx";
import { useSceneStore } from "../stores/sceneStore";
import { SceneTalkConnection } from "../services/sceneTalkConnection.ts";

const BabylonScenePage = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const connRef = useRef<SceneTalkConnection | null>(null);

  // Get state and actions from the store
  const {
    wsStatus,
    setWsStatus,
    params,
    setMeshData,
    addStatusLog,
    clearStatusLog,
    setGenerateTime,
    requestInFlight,
    setRequestInFlight,
    pendingRequest,
    setPendingRequest,
    exportFormat,
    setExportFormat
  } = useSceneStore();

  // Initialize WebSocket service
  useEffect(() => {
    const wsService = new SceneTalkConnection();
    connRef.current = wsService;

    // Set up event handlers
    wsService.setHandlers({
      onStatusChange: (status) => {
        setWsStatus(status);
        if (status === "connected") {
          // Send initial cook request when connected
          regenerateMesh();
        }
      },
      onStatusLog: (log) => {
        addStatusLog(log);
      },
      onGeometryData: (data) => {
        if (data.points && data.indices) {
          setMeshData({
            points: data.points,
            indices: data.indices,
            normals: data.normals,
            uvs: data.uvs
          });
        }
      },
      onFileDownload: (fileName, base64Content) => {
        SceneTalkConnection.downloadFileFromBase64(fileName, base64Content);
      },
      onRequestComplete: (elapsedTime) => {
        setGenerateTime(Math.round(elapsedTime).toString());
        setRequestInFlight(false);

        if (pendingRequest) {
          setPendingRequest(false);
          setTimeout(() => regenerateMesh(), 10);
        }

        // Reset export format after completion
        setExportFormat(null);
      }
    });

    // Connect to WebSocket server
    wsService.connect();

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

  // Function to send a regenerate mesh request
  const regenerateMesh = (format = "raw") => {
    if (!connRef.current) {
      console.error("SceneTalk connection not initialized");
      return;
    }

    if (requestInFlight) {
      setPendingRequest(true);
      return;
    }

    // Clear the status log
    clearStatusLog();

    // Set request in flight
    setRequestInFlight(true);

    // Send the cook request
    connRef.current.sendCookRequest(params, format);
  };

  // Watch for export format changes
  useEffect(() => {
    if (exportFormat) {
      regenerateMesh(exportFormat);
    }
  }, [exportFormat]);

  // Set loading to false after initial setup
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Helmet>
        <title>Mythica • {t("common.babylonScene")}</title>
      </Helmet>

      <SceneControls />
      <SceneViewer />
    </Box>
  );
};

export default BabylonScenePage;
