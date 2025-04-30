import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import SceneViewer from "@components/BabylonViewer/SceneViewer";
import SceneControls from "@components/BabylonViewer/SceneControls";
import { useSceneStore } from "scenetalk";
import { SceneTalkConnection } from "scenetalk";
import { useWindowSize } from "@hooks/useWindowSize";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAssetByVersion, useGetJobDefinition } from "@queries/packages";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import { StatusBar } from "@components/StatusBar";

export const PackageScene: React.FC = () => {
  const { asset_id, version_id } = useParams();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const wsServiceRef = useRef<SceneTalkConnection | null>(null);
  const { currentWidth } = useWindowSize();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidepanelOpen, setIsSidepanelOpen] = useState(true); // New state for panel visibility

  // Get state and actions from the store
  const {
    wsStatus,
    setWsStatus,
    selectedHdaId,
    paramValues,
    fileUpload,
    inputFiles,
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
    reset
  } = useSceneStore();

  const navigate = useNavigate();

  const { data: jobDefinitions } =
    useGetJobDefinition(asset_id as string, (version_id as string)?.split("."));

  const { data: assetVersion } =
    useGetAssetByVersion(asset_id as string, version_id as string);

  // Initialize WebSocket service
  useEffect(() => {
    const sceneTalkUrl = import.meta.env.VITE_SCENE_TALK_URL;
    const wsService = new SceneTalkConnection(sceneTalkUrl);
    wsServiceRef.current = wsService;
    wsService.connect();

    return () => {
      wsService.disconnect();
    };
  }, []);

  // Update handlers when hda changes
  useEffect(() => {
    const wsService = wsServiceRef.current;
    if (!wsService) return;
    reset();
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
            colors: data.colors,
          });
        }
      },
      onFileDownload: (fileName, base64Content) => {
        SceneTalkConnection.downloadFileFromBase64(fileName, base64Content);
      },
      onRequestComplete: (elapsedTime) => {
        const elapsedTimeInSeconds = Math.round(elapsedTime);
        setGenerateTime(elapsedTimeInSeconds.toString());
        addStatusLog(`Generation completed in ${elapsedTimeInSeconds} ms`);

        setRequestInFlight(false);

        if (pendingRequest) {
          setPendingRequest(false);
          setTimeout(() => regenerateMesh(), 10);
        }

        // Reset export format after completion
        setExportFormat(null);
      },
    });
  }, [selectedHdaId]);

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

    if (!selectedHdaId) {
      console.error("No HDA selected");
      return;
    }

    const jobDef = jobDefinitions?.find(
      (definition) => definition.source.file_id === selectedHdaId,
    );
    if (!jobDef) {
      console.error("Failed to find job definition");
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
    try {

      const dependencyFileIds = jobDef.params_schema.params['dependencies']?.default || [];

      // Send the cook request with all parameters for the current HDA
      wsServiceRef.current.sendCookRequestById(
        selectedHdaId as string,
        dependencyFileIds as string[],
        paramValues,
        inputFiles,
        format,
      );
    } catch (error) {
      console.error("Error sending cook request:", error);
      setRequestInFlight(false);
    }
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
  }, [selectedHdaId, paramValues, inputFiles, jobDefinitions]);

  useEffect(() => {
    if (fileUpload && wsStatus === "connected" && !requestInFlight) {
      wsServiceRef.current?.sendFileUploadMessage(fileUpload.file, fileUpload.callback);
    }
  }, [fileUpload]);

  // Set loading to false after initial setup
  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading || !assetVersion) {
    return <CircularProgress />;
  }

  return (
    <>
      <Stack
        direction="row"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        mb="12px"
      >
        <Stack direction="row" alignItems="center" gap="12px">
          <Typography level="h2">{assetVersion?.name}</Typography>
          <Chip
            key={assetVersion?.version.join(".")}
            variant="soft"
            color="primary"
            size="lg"
            sx={{ borderRadius: "xl" }}
          >
            {assetVersion?.version.join(".")}
          </Chip>
        </Stack>
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<LucideChevronLeft height="20px" width="20px" />}
          sx={{ pl: "10px" }}
          onClick={() => {
            navigate(`/package-view/${asset_id}/versions/${version_id}`);
          }}
        >
          Back to Package view
        </Button>
      </Stack>
      <Box
        ref={(el: HTMLElement) => {
          if (el) {
            const topPosition = el.getBoundingClientRect().top;
            const viewportHeight = document.documentElement.clientHeight;
            const availableHeight = viewportHeight - topPosition - 40;
            // Apply the height directly or store in a state variable
            el.style.height = `${availableHeight}px`;
          }
        }}
        sx={{ display: "flex", position: "relative", padding: 0, margin: 0 }}
      >
        <Helmet>
          <title>Mythica • {t("common.sceneViewer")}</title>
        </Helmet>

        {currentWidth > 700 ? (
          <>
            {/* Toggle button for sidepanel */}
            <Button
              color="neutral"
              variant="soft"
              sx={{
                position: "absolute",
                left: isSidepanelOpen ? "395px" : "5px",
                top: "5px",
                zIndex: 10,
                minWidth: "32px",
                width: "32px",
                height: "32px",
                padding: 0,
              }}
              onClick={() => setIsSidepanelOpen(!isSidepanelOpen)}
            >
              {isSidepanelOpen ? 
                <LucideChevronLeft height="20px" width="20px" /> : 
                <LucideChevronRight height="20px" width="20px" />
              }
            </Button>
            
            {/* Floating sidepanel */}
            <Box
              sx={{
                position: "absolute",
                left: isSidepanelOpen ? "0" : "-390px",
                top: 0,
                bottom: 0,
                height: "100%", 
                zIndex: 5,
                transition: "none",
                backgroundColor: "background.surface",
                boxShadow: isSidepanelOpen ? "md" : "none",
                borderRight: isSidepanelOpen ? "1px solid" : "none",
                borderColor: "divider",
                visibility: isSidepanelOpen ? "visible" : "hidden",
                overflow: "auto", // Enable scrollbar when needed
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SceneControls 
                width={390} 
                assetVersion={assetVersion}
                jobDefinitions={jobDefinitions}/>
            </Box>
          </>
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
                <SceneControls
                  width={currentWidth - 40}
                  assetVersion={assetVersion}
                  jobDefinitions={jobDefinitions}
                />
              </DialogContent>
            </ModalDialog>
          </Modal>
        )}

        <SceneViewer packageName={assetVersion?.name as string} />
        <StatusBar />
      </Box>
    </>
  )
};
