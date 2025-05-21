import { useEffect, useRef } from "react";
import { useSceneStore } from "./sceneStore";
import { SceneTalkConnection } from "./sceneTalkConnection";

export interface SceneTalkConnectorProps {

}

export const SceneTalkConnector: React.FC<SceneTalkConnectorProps> = () => {
  const wsServiceRef = useRef<SceneTalkConnection | null>(null);

  // Get state and actions from the store
  const {
    wsStatus,
    setWsStatus,
    selectedHdaId,
    paramValues,
    dependencyFileIds,
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
    setLatency
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
        const meshes = Object.entries(data);
        if (meshes.length == 0) {
          return;
        }

        const mesh = meshes[0][1] as any;
        if (mesh.points && mesh.indices) {
          setMeshData({
            points: mesh.points,
            indices: mesh.indices,
            normals: mesh.normals,
            uvs: mesh.uvs,
            colors: mesh.colors,
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
        const errors = currentStatusLog.filter(e => e.level === "error");
        
        if (errors.length > 0) {
            const errorMessage = errors[0].log || "Unknown error";
            addStatusLog("error", 
                `Failed with error: "${errorMessage}"`);
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
  }, [selectedHdaId, dependencyFileIds]);



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
      // Send the cook request with all parameters for the current HDA
      wsServiceRef.current.sendCookRequestById(
        selectedHdaId as string,
        dependencyFileIds as string[] || [],
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
