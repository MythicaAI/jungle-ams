import * as BABYLON from '@babylonjs/core';

// Function to create mesh from data received from WebSocket
export const createMeshFromWebSocketData = (
  scene: any,
  mesh: any,
  meshData: any,
  material: any
) => {
  if (!scene || !meshData.points || !meshData.indices) {
    console.error("Invalid mesh data or scene");
    return null;
  }

  // Dispose of existing mesh if it exists
  if (mesh) {
    mesh.dispose();
  }

  // Create a new mesh
  const newMesh = new BABYLON.Mesh("customMesh", scene);

  // Assign material
  if (material) {
    newMesh.material = material;
  }

  // Create vertex data
  const vertexData = new BABYLON.VertexData();
  vertexData.positions = meshData.points;
  vertexData.indices = meshData.indices;

  // Add normals if provided
  if (meshData.normals) {
    vertexData.normals = meshData.normals;
  }

  // Add UVs if provided
  if (meshData.uvs) {
    vertexData.uvs = meshData.uvs;
  }

  // Apply vertex data to mesh
  vertexData.applyToMesh(newMesh);

  return newMesh;
};

// Create WebSocket connection
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

// Send a cook message to the WebSocket
export const sendCookMessage = (ws: WebSocket, params: {
  length: number;
  radius: number;
  numsides: number;
}, format: string = "raw") => {
  if (ws.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected");
    return false;
  }

  const cookMessage = {
    "op": "cook",
    "data": {
      "hda_path": {
        "file_id": "file_xxx",
        "file_path": "assets/mythica.crystal.1.0.hda"
      },
      "definition_index": 0,
      "format": format,
      "length": params.length,
      "radius": params.radius,
      "numsides": params.numsides
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

// Download file from base64 data
export const downloadFileFromBase64 = (fileName: string, base64Content: string) => {
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
};
