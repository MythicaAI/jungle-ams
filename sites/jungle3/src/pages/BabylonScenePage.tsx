import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
} from "@mui/joy";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import SceneViewer from "@components/BabylonViewer/SceneViewer";
import SceneControls from "@components/BabylonViewer/SceneControls";
import { useSceneStore } from "@store/sceneStore";
import { SceneTalkConnection } from "../services/sceneTalkConnection";
import { useWindowSize } from "@hooks/useWindowSize";

const BabylonScenePage = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const wsServiceRef = useRef<SceneTalkConnection | null>(null);
  const { currentWidth } = useWindowSize();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get state and actions from the store
  const {
    wsStatus,
    setWsStatus,
    hdaSchemas,
    selectedHdaIndex,
    paramValues,
    setMeshData,
    addStatusLog,
    clearStatusLog,
    setGenerateTime,
    requestInFlight,
    setRequestInFlight,
    pendingRequest,
    setPendingRequest,
    exportFormat,
    setExportFormat,
  } = useSceneStore();

  // Get current HDA schema
  const currentSchema = hdaSchemas[selectedHdaIndex];

  // Initialize WebSocket service
  useEffect(() => {
    const wsService = new SceneTalkConnection("ws://localhost:8765");
    wsServiceRef.current = wsService;

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
            uvs: data.uvs,
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
      },
    });

    // Connect to WebSocket server
    wsService.connect();

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentWidth > 700 && isModalOpen) {
      setIsModalOpen(false);
    }
  }, [currentWidth]);

  // Function to send a regenerate mesh request
  const regenerateMesh = (format = "raw") => {
    if (!wsServiceRef.current) {
      console.error("WebSocket service not initialized");
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

    // Get the file path for the current HDA
    const hdaFilePath = currentSchema.file_path;

    // Send the cook request with all parameters for the current HDA
    wsServiceRef.current.sendCookRequest(hdaFilePath, paramValues, format);
  };

  // Watch for export format changes
  useEffect(() => {
    if (exportFormat) {
      regenerateMesh(exportFormat);
    }
  }, [exportFormat]);

  // Re-generate mesh when HDA or parameters change
  useEffect(() => {
    if (wsStatus === "connected" && !requestInFlight) {
      regenerateMesh();
    }
  }, [selectedHdaIndex, paramValues]);

  // Set loading to false after initial setup
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", position: "relative" }}>
      <Helmet>
        <title>Mythica • {t("common.sceneViewer")}</title>
      </Helmet>

      {currentWidth > 700 ? (
        <SceneControls />
      ) : (
        <Button
          color="neutral"
          sx={{
            position: "absolute",
            right: 5,
            top: 5,
            zIndex: 1,
          }}
          onClick={() => setIsModalOpen(true)}
        >
          Open Controls
        </Button>
      )}
      {isModalOpen && (
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalDialog layout="fullscreen">
            <ModalClose />
            <DialogTitle>Controls</DialogTitle>
            <DialogContent>
              <SceneControls width={currentWidth - 40} />
            </DialogContent>
          </ModalDialog>
        </Modal>
      )}

      <SceneViewer />
    </Box>
  );
};

export default BabylonScenePage;
