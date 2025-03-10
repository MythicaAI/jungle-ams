import { create } from "zustand";

// Mesh data type
export interface MeshData {
  points: number[];
  indices: number[];
  normals?: number[];
  uvs?: number[];
}

// Parameters for the 3D model
export interface SceneParams {
  length: number;
  radius: number;
  numsides: number;
}

// WebSocket status
export type ConnectionStatus = "connected" | "disconnected";

// Store interface
interface SceneState {
  // Scene parameters
  params: SceneParams;
  updateParam: (key: keyof SceneParams, value: number) => void;

  // WebSocket state
  wsStatus: ConnectionStatus;
  setWsStatus: (status: ConnectionStatus) => void;

  // Mesh data
  meshData: MeshData | null;
  setMeshData: (data: MeshData | null) => void;

  // UI state
  isWireframe: boolean;
  toggleWireframe: () => void;
  setWireframe: (value: boolean) => void;

  // Log state
  showLogWindow: boolean;
  toggleLogWindow: () => void;
  setShowLogWindow: (value: boolean) => void;

  // Generation metrics
  generateTime: string;
  setGenerateTime: (time: string) => void;

  // Status logs
  statusLog: string[];
  addStatusLog: (log: string) => void;
  clearStatusLog: () => void;

  // Export functions
  exportFormat: string | null;
  setExportFormat: (format: string | null) => void;

  // Request state
  requestInFlight: boolean;
  setRequestInFlight: (value: boolean) => void;

  pendingRequest: boolean;
  setPendingRequest: (value: boolean) => void;

  // Utility methods
  reset: () => void;
  resetParams: () => void;
}

// Default values
const defaultParams: SceneParams = {
  length: 2.5,
  radius: 0.6,
  numsides: 6
};

export const useSceneStore = create<SceneState>((set) => ({
  // Scene parameters
  params: { ...defaultParams },
  updateParam: (key, value) => set((state) => ({
    params: { ...state.params, [key]: value }
  })),

  // WebSocket state
  wsStatus: "disconnected",
  setWsStatus: (status) => set({ wsStatus: status }),

  // Mesh data
  meshData: null,
  setMeshData: (data) => set({ meshData: data }),

  // UI state
  isWireframe: false,
  toggleWireframe: () => set((state) => ({ isWireframe: !state.isWireframe })),
  setWireframe: (value) => set({ isWireframe: value }),

  // Log state
  showLogWindow: false,
  toggleLogWindow: () => set((state) => ({ showLogWindow: !state.showLogWindow })),
  setShowLogWindow: (value) => set({ showLogWindow: value }),

  // Generation metrics
  generateTime: "0",
  setGenerateTime: (time) => set({ generateTime: time }),

  // Status logs
  statusLog: [],
  addStatusLog: (log) => set((state) => ({
    statusLog: [...state.statusLog, log]
  })),
  clearStatusLog: () => set({ statusLog: [] }),

  // Export functions
  exportFormat: null,
  setExportFormat: (format) => set({ exportFormat: format }),

  // Request state
  requestInFlight: false,
  setRequestInFlight: (value) => set({ requestInFlight: value }),

  pendingRequest: false,
  setPendingRequest: (value) => set({ pendingRequest: value }),

  // Utility methods
  reset: () => set({
    params: { ...defaultParams },
    meshData: null,
    isWireframe: false,
    showLogWindow: false,
    generateTime: "0",
    statusLog: [],
    exportFormat: null,
    requestInFlight: false,
    pendingRequest: false
  }),

  resetParams: () => set({ params: { ...defaultParams } })
}));
