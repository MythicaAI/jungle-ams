import { SceneParams } from "../stores/sceneStore";

interface CookMessage {
  op: string;
  data: {
    hda_path: {
      file_id: string;
      file_path: string;
    };
    definition_index: number;
    format: string;
    length: number;
    radius: number;
    numsides: number;
  };
}

// WebSocket connection service
export class SceneTalkConnection {
  private ws: WebSocket | null = null;
  private requestInFlight = false;
  private pendingRequest = false;
  private requestStartTime = 0;
  private handlers: {
    onStatusChange?: (status: "connected" | "disconnected") => void;
    onStatusLog?: (log: string) => void;
    onGeometryData?: (data: any) => void;
    onFileDownload?: (fileName: string, base64Content: string) => void;
    onRequestComplete?: (elapsedTime: number) => void;
  } = {};

  constructor(private wsUrl: string = "ws://scenetalk.mythica.gg:8765") {}

  // Set event handlers
  setHandlers(handlers: typeof this.handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Connect to the WebSocket server
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      console.log("Connected to WebSocket server");
      if (this.handlers.onStatusChange) {
        this.handlers.onStatusChange("connected");
      }
    };

    this.ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      if (this.handlers.onStatusChange) {
        this.handlers.onStatusChange("disconnected");
      }
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
    };
  }

  // Disconnect from the WebSocket server
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Send a cook request to generate a mesh
  sendCookRequest(params: SceneParams, format: string = "raw") {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return false;
    }

    if (this.requestInFlight) {
      this.pendingRequest = true;
      return false;
    }

    this.requestInFlight = true;
    this.requestStartTime = performance.now();

    const crystalParamValues = {
      "length": params.length,
      "radius": params.radius,
      "numsides": params.numsides
    };
    const rockifyParamValues = {
      Stage: {
        type: 'slider',
        label: 'Stage',
        min: 0,
        max: 3,
        step: 1,
        default: 1,
      },
      base_rangemax: {
        type: 'slider',
        label: 'Base Noise',
        min: 0.0,
        max: 10.0,
        step: 0.5,
        default: 6.5
      },
      mid_rangemax: {
        type: 'slider',
        label: 'Mid Noise',
        min: 0.0,
        max: 3,
        step: 0.25,
        default: 0.25
      },
      top_rangemax: {
        type: 'slider',
        label: 'Top Noise',
        min: 0.0,
        max: 5.0,
        step: 0.5,
        default: 0.5
      },
      smoothingiterations: {
        type: 'hidden',
        default: 0
      },
      vertDensity: {
        type: 'hidden',
        default: 0.1
      },
      size: {
        type: 'hidden',
        default: 512
      },
      input0: {
        type: 'hidden',
        default: {
          file_id: "file_xxx",
          file_path: "assets/SM_Shape_04_a.usd"
        }
      },
    }
    const cookMessage: CookMessage = {
      "op": "cook",
      "data": {
        "hda_path": {
          "file_id": "file_xxx",
          "file_path": "assets/Mythica.Rockify.1.0.hda"
        },
        "definition_index": 0,
        "format": format,
        ...paramValues
      }
    };

    try {
      this.ws.send(JSON.stringify(cookMessage));
      return true;
    } catch (error) {
      console.error("Error sending cook message:", error);
      this.requestInFlight = false;
      return false;
    }
  }

  // Handle incoming WebSocket messages
  private handleMessage(data: any) {
    if (data.op === "status" && this.handlers.onStatusLog) {
      this.handlers.onStatusLog(data.data);
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

  // Download helper function for file data
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
