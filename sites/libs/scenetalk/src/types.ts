
export interface InputFile  {
    file_id: string;
    [k: string]: any;
}

// Mesh data type
export interface MeshData {
    points: number[];
    indices: number[];
    normals?: number[];
    uvs?: number[];
    colors?: number[];
  }
  
  // WebSocket status
export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";
