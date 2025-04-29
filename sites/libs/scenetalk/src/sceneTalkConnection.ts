/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuid } from "uuid";
import { InputFile } from "./types"; 

// SceneTalk WebSocket Service
export class SceneTalkConnection {
  private ws: WebSocket | null = null;
  private requestInFlight = false;
  private pendingRequest = false;
  private requestStartTime = 0;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private handlers: {
    onStatusChange?: (status: "connected" | "disconnected" | "reconnecting") => void;
    onStatusLog?: (log: string) => void;
    onGeometryData?: (data: any) => void;
    onFileDownload?: (fileName: string, base64Content: string) => void;
    onRequestComplete?: (elapsedTime: number) => void;
  } = {};

  constructor(private wsUrl: string = "ws://localhost:8765") {}

  // Set event handlers
  setHandlers(handlers: typeof this.handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Connect to the WebSocket server
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      console.log("Connected to WebSocket server");
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      if (this.handlers.onStatusChange) {
        this.handlers.onStatusChange("connected");
      }
      if (this.handlers.onStatusLog) {
        this.handlers.onStatusLog("Connected to server");
      }
    };

    this.ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      if (this.handlers.onStatusChange) {
        this.handlers.onStatusChange("disconnected");
      }
      if (this.handlers.onStatusLog) {
        this.handlers.onStatusLog("Disconnected from server");
      }
      this.attemptReconnect();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (this.handlers.onStatusLog) {
        this.handlers.onStatusLog("WebSocket connection error");
      }
    };
  }

  // Attempt to reconnect with exponential backoff
  private attemptReconnect() {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.isReconnecting = true;

    if (this.handlers.onStatusChange) {
      this.handlers.onStatusChange("reconnecting");
    }

    if (this.handlers.onStatusLog) {
      this.handlers.onStatusLog(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
    }

    // Calculate backoff time: 1s, 2s, 4s, 8s, 16s
    const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 5000);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.isReconnecting = false;
      this.connect();
    }, backoffTime);
  }

  // Reset reconnection attempts
  resetReconnect() {
    this.reconnectAttempts = 0;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.isReconnecting = false;
  }

  // Disconnect from the WebSocket server
  disconnect() {
    this.resetReconnect();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendCookRequestById(hdaFileId: string, dependencyFileIds: string[], params: {[key: string]: any}, inputFiles: {[key:string]: InputFile}, format: string = "raw") {
    if (this.requestInFlight) {
      this.pendingRequest = true;
      return false;
    }

    this.requestInFlight = true;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      if (this.handlers.onStatusLog) {
        this.handlers.onStatusLog("Failed to send request: Connection not open");
      }
      this.attemptReconnect();
      return false;
    }

    this.requestStartTime = performance.now();

    const files: { [key: string]: { file_id: string, [additionalKey: string]: any } } = {};
    Object.entries(inputFiles).forEach(([key, file]) => {
      files[key] = { ...file };
    });
     
    const cookMessage = {
      "op": "cook",
      "data": {
        "hda_path": {
          "file_id": hdaFileId,
        },
        "definition_index": 0,
        "format": format,
        ...(dependencyFileIds.length > 0 ? {"dependencies": dependencyFileIds.map(id => ({ file_id: id }))} : {}),
        ...files,
        ...params
      }
    };
    console.log("Sending cook message:", cookMessage);

    try {
      this.ws.send(JSON.stringify(cookMessage));
      if (this.handlers.onStatusLog) {
        this.handlers.onStatusLog("Sent cook request to server");
      }
      return true;
    } catch (error) {
      console.error("Error sending cook message:", error);
      if (this.handlers.onStatusLog) {
        this.handlers.onStatusLog(`Error sending request: ${error}`);
      }
      return false;
    } finally {
      this.requestInFlight = false;
    }

  }

  
  sendFileUploadMessage(file: File, callback: (file_id: string) => void) {
    if (!file) {
      console.error("File params are missing")
      return false;
    }  
    const file_id = uuid();
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      if (this.handlers.onStatusLog) {
        this.handlers.onStatusLog("Failed to send request: Connection not open");
      }
      this.attemptReconnect();
      return false;
    }
    let file_type = file.type;
    if (!file_type) {
      switch (file.name.split('.').pop()) {
        case "usdz":
          file_type = "application/usdz"
          break;
        case "usd":
          file_type = "application/usd"
          break;
        case "glb":
          file_type = "application/gltb"
          break;
        case "gltf":
          file_type = "application/gltf"
          break;
        case "fbx":
          file_type = "application/fbx"
          break;
        case "obj":
          file_type = "application/obj"
          break;
        default:
          file_type = "application/octet-stream";
      }
    }
    const contentType = file_type;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Content = (reader.result as string).split(',')[1];

      const uploadMessage = {
        "op": "file_upload",
        "data": {
          "file_id": file_id,
          "content_type": contentType,
          "content_base64": base64Content
        }
      };  
      console.log("Sending upload message:", uploadMessage);

      try {
        if (!this.ws) throw new Error("WebSocket is not initialized");
        this.ws.send(JSON.stringify(uploadMessage));
        callback(file_id);
        return true;
      } catch (error) {
        console.error("Error sending file upload message:", error);
        return false;
      }
    };   
    reader.readAsDataURL(file);         
  }
  

  // Handle incoming WebSocket messages
  private handleMessage(data: any) {
    if (data.op === "status" && this.handlers.onStatusLog) {
      this.handlers.onStatusLog(data.data);
    }

    if (data.op === "error" && this.handlers.onStatusLog) {
      this.handlers.onStatusLog(data.data);
      this.handleRequestComplete();
    }

    if (data.op === "geometry" && this.handlers.onGeometryData) {
      this.handlers.onGeometryData(data.data);
      this.handleRequestComplete();
    }

    if (data.op === "file" && this.handlers.onFileDownload) {
      this.handlers.onFileDownload(data.data.file_name, data.data.content_base64);
      this.handleRequestComplete();
    }
  }

  // Handle completion of a request
  private handleRequestComplete() {
    const elapsedTime = performance.now() - this.requestStartTime;

    if (this.handlers.onRequestComplete) {
      this.handlers.onRequestComplete(elapsedTime);
    }

    this.requestInFlight = false;

    if (this.pendingRequest) {
      this.pendingRequest = false;
      // Trigger the pending request with a small delay to allow UI updates
      setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          // Re-send the last cook request
          // In a real implementation, we would store the last params and format
          // For simplicity, the caller should check for completion and re-send
        }
      }, 10);
    }
  }

  // Check if connection is active
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Static helper function for file downloads
  static downloadFileFromBase64(fileName: string, base64Content: string) {
    try {
      // Decode the Base64 string into a binary string
      const binaryStr = atob(base64Content);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Create a blob and trigger download
      const blob = new Blob([bytes], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Error downloading file:", error);
      return false;
    }
  }
}

// Helper utility functions for mesh creation and WebSocket handling

/**
 * Create WebSocket connection with simplified callback interface
 */
export const createWebSocketConnection = (url: string, callbacks: {
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
}) => {
  const ws = new WebSocket(url);

  if (callbacks.onOpen) {
    ws.onopen = callbacks.onOpen;
  }

  if (callbacks.onClose) {
    ws.onclose = callbacks.onClose;
  }

  if (callbacks.onMessage) {
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callbacks.onMessage?.(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }

  if (callbacks.onError) {
    ws.onerror = callbacks.onError;
  }

  return ws;
};

/**
 * Send a simple cook message without requiring the full service class
 */
export const sendSimpleCookMessage = (ws: WebSocket, hdaFilePath: string, params: {[key: string]: any}, format: string = "raw") => {
  if (ws.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected");
    return false;
  }

  const cookMessage = {
    "op": "cook",
    "data": {
      "hda_path": {
        "file_id": "file_xxx",
        "file_path": hdaFilePath
      },
      "definition_index": 0,
      "format": format,
      ...params
    }
  };

  try {
    ws.send(JSON.stringify(cookMessage));
    return true;
  } catch (error) {
    console.error("Error sending cook message:", error);
    return false;
  }
};
