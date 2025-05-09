import { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogContent,
  DialogTitle,
  FormLabel,
  Modal,
  ModalClose,
  ModalDialog,
  Select,
  Option,
  Stack,
  Typography,
} from "@mui/joy";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import SceneViewer from "@components/BabylonViewer/SceneViewer";
import SceneControls from "@components/BabylonViewer/SceneControls";
import GeneratorSelector from "@components/BabylonViewer/GeneratorSelector";
import { useSceneStore } from "scenetalk";
import { SceneTalkConnection } from "scenetalk";
import { useWindowSize } from "@hooks/useWindowSize";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAssetByVersion, useGetJobDefinition } from "@queries/packages";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import { StatusBar } from "@components/StatusBar";
import { JobDefinition } from "@queries/packages/types";
import { DefaultParmFactory, ParmFactoryProps, ParmFactoryProvider } from "houdini-ui";
import { set } from "lodash";

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
    setParamValues,
    fileUpload,
    inputFiles,
    setMeshData,
    addStatusLog,
    flushStatusLog,
    clearStatusLog,
    setGenerateTime,
    requestInFlight,
    setRequestInFlight,
    pendingRequest,
    setPendingRequest,
    exportFormat,
    setExportFormat,
    setLatency,
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
      onStatusLog: (level, log) => {
        addStatusLog(level, log);
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
      onLatencyUpdate: (latency) => {
        setLatency(latency);
      },
      onRequestComplete: (elapsedTime) => {
        const elapsedTimeInSeconds = Math.round(elapsedTime);
        setGenerateTime(elapsedTimeInSeconds.toString());

        flushStatusLog();
        const currentStatusLog = useSceneStore.getState().statusLog;
        const errorCount = currentStatusLog.filter(e => e.level === "error").length;
        const hasErrors = errorCount > 0;

        if (hasErrors) {
            addStatusLog("error",
                `Generation completed in ${elapsedTimeInSeconds} ms with errors`);
        } else {
            addStatusLog("info",
                `Generation completed in ${elapsedTimeInSeconds} ms`);
        }
        flushStatusLog();

        setRequestInFlight(false);

        if (pendingRequest) {
            setPendingRequest(false);
            setTimeout(() => regenerateMesh(), 10);
        }

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

    const jd = jobDefinitions?.find(
      (definition) => definition.source.file_id === selectedHdaId,
    );
    if (!jd) {
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

      const dependencyFileIds = jd.params_schema.params['dependencies']?.default || [];

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
  }, [paramValues, inputFiles, jobDefinitions]);

  useEffect(() => {
    if (fileUpload && wsStatus === "connected" && !requestInFlight) {
      wsServiceRef.current?.sendFileUploadMessage(fileUpload.file, fileUpload.callback);
    }
  }, [fileUpload]);

  const [jobDef, setJobDef] = useState<JobDefinition | null>(null);

  useEffect(() => {
    if(jobDefinitions?.length === 1) {
      setJobDef(jobDefinitions[0]);
    } else {
      setJobDef(
        jobDefinitions?.find(
          (definition) => definition.source.file_id === selectedHdaId,
        ) || null,
      );
    }

  }, [selectedHdaId, jobDefinitions]);

  useEffect(() => {
    if (jobDef) {
      setParamValues(jobDef.params_schema.default);
    }
  }, [jobDef]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const FilteredParmFactory: React.FC<ParmFactoryProps> = useCallback((props) => {

    return (
      <div 
        style={{
          display: (jobDef?.params_schema.hidden?.[props.parmTemplate.name] ? 'none' : 'block'),
        }}>
        <DefaultParmFactory
          {
            ...props
          }
        />
      </div>
      
    );
  },[jobDef?.params_schema.hidden])
  

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
        {currentWidth > 700 ? (
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
        ) : (
          <Box />
        )}

        <FormLabel>
          Generator:
        </FormLabel>
        <GeneratorSelector 
          jobDefinitions={jobDefinitions} 
          assetVersion={assetVersion} 
        />
        <FormLabel>
          Preset:
        </FormLabel>
        <Select
          variant="soft"
          name="preset_select"
          placeholder="Select a Preset"
          onChange={(e, value) => {
            setJobDef(
              jobDefinitions?.find(
                (definition) => definition.job_def_id === value,
              ) || null,
            );
          }}
          sx={{ minWidth: 200 }}
          value={jobDef?.job_def_id || jobDefinitions?.[0]?.job_def_id}
          multiple={false}
        >
          {jobDefinitions?.filter(
            (item) => item.source.file_id === selectedHdaId
            )?.map((jd) => (
            <Option key={jd.job_def_id} value={jd.job_def_id}>
              {jd.name}
            </Option>
          ))}
        </Select>
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<LucideChevronLeft height="20px" width="20px" />}
          sx={{ pl: "10px" }}
          onClick={() => {
            navigate(`/package-view/${asset_id}/versions/${version_id}`);
          }}
        >
          {currentWidth > 700 ? "Back to Package view" : "Back"}
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
                left: isSidepanelOpen ? "0" : "-390px",
                width: isSidepanelOpen ? "390px" : "0px",
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
              {jobDef ?
                <ParmFactoryProvider value={FilteredParmFactory as React.FC<ParmFactoryProps>}>              
                  <SceneControls 
                    style={{width:390}} 
                    assetVersion={assetVersion}
                    jobDefinition={jobDef} />
                </ParmFactoryProvider>
              : 
                <Box sx={{ width: 390,padding: "20px" }}>
                  <Typography level="h4" fontSize="medium">
                    Select a Generator to continue
                  </Typography>
                </Box>
              } 
            </Box>
          </>
        ) : (
          <Button
            color="neutral"
            sx={{
              position: "absolute",
              left: 5,
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
              {jobDef ?
                <ParmFactoryProvider value={FilteredParmFactory as React.FC<ParmFactoryProps>}>              
                  <SceneControls 
                    style={{width:currentWidth - 40}} 
                    assetVersion={assetVersion}
                    jobDefinition={jobDef} />
                </ParmFactoryProvider>
              : 
                <Box sx={{ width: currentWidth - 40,padding: "20px" }}> 
                  <Typography level="h4" fontSize="medium">
                    Select a Generator to continue
                  </Typography>
                </Box>
              } 
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
