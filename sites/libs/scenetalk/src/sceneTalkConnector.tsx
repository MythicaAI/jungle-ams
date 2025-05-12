import { useEffect, useRef } from "react";
import { useSceneStore } from "./sceneStore";
import { SceneTalkConnection } from "./sceneTalkConnection";

export interface SceneTalkConnectorProps {
    dependencyFileIds?: string[];
}

export const SceneTalkConnector: React.FC<SceneTalkConnectorProps> = (props) => {
  const wsServiceRef = useRef<SceneTalkConnection | null>(null);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHdaId]);



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

    if (requestInFlight) {
      setPendingRequest(true);
      return;
    }

    // Clear the status log
    clearStatusLog();

    // Set request in flight
    setRequestInFlight(true);
    try {

      const dependencyFileIds = props.dependencyFileIds;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportFormat]);

  // Re-generate mesh when HDA or parameters change
  useEffect(() => {
    if (wsStatus === "connected" && !requestInFlight) {
      regenerateMesh();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramValues, inputFiles]);

  useEffect(() => {
    if (fileUpload && wsStatus === "connected" && !requestInFlight) {
      wsServiceRef.current?.sendFileUploadMessage(fileUpload.file, fileUpload.callback);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUpload]);


  // This component doesn't render UI
  return null;
};
