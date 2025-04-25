import { create } from "zustand";
import { InputFile, MeshData } from "./types";


// WebSocket status
export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

// Store interface
interface SceneState {
    // HDA schemas and selection
  selectedHdaId: string | null;
  setSelectedHdaId: (selectedHdaId: string) => void;

  inputFiles: { [key: string]: InputFile };
  setInputFiles: (filesByInput: { [key: string]:InputFile }) => void;
  setInputFile: (key: string, file: InputFile) => void;

  // Parameter values
  paramValues: { [key: string]: any };
  setParamValues: (paramValues: {[key: string]: any}) => void;

  fileUpload: { file: File, callback:(file_id:string)=>void } | null;
  setFileUpload: (file: File, callback:(file_id:string)=>void) => void;


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
}

// Create a buffer outside the store
let pendingLogs: string[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

export const useSceneStore = create<SceneState>((set) => ({
  selectedHdaId: null,
  setSelectedHdaId: (selectedHdaId) => set({ selectedHdaId: selectedHdaId }),

  // Input files
  inputFiles: {},
  setInputFiles: (filesByInput) => set({ inputFiles: filesByInput }),
  setInputFile: (key, file) =>
    set((state) => ({
      inputFiles: { ...state.inputFiles, [key]: file },
    })),

  paramValues: { },
  setParamValues: (values) => set({ paramValues: values }),

  fileUpload: null,
  setFileUpload: (file, callback) => set({ fileUpload: {file: file, callback: callback} }),

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
  toggleLogWindow: () =>
    set((state) => ({ showLogWindow: !state.showLogWindow })),
  setShowLogWindow: (value) => set({ showLogWindow: value }),

  // Generation metrics
  generateTime: "0",
  setGenerateTime: (time) => set({ generateTime: time }),

  // Status logs
  statusLog: [],
  addStatusLog: (log) => {
    pendingLogs.push(log);

    // Debounce the update
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(() => {
      set(state => ({
        statusLog: [...state.statusLog, ...pendingLogs]
      }));
      pendingLogs = [];
    }, 50);
  },
  clearStatusLog: () => {
    pendingLogs = [];
    if (flushTimeout) clearTimeout(flushTimeout);
    set({ statusLog: [] });
  },

  // Export functions
  exportFormat: null,
  setExportFormat: (format) => set({ exportFormat: format }),

  // Request state
  requestInFlight: false,
  setRequestInFlight: (value) => set({ requestInFlight: value }),

  pendingRequest: false,
  setPendingRequest: (value) => set({ pendingRequest: value }),

  // Utility methods
  reset: () => {
    set({
      paramValues: {},
      fileUpload: null,
      meshData: null,
      isWireframe: false,
      showLogWindow: false,
      generateTime: "0",
      statusLog: [],
      exportFormat: null,
      requestInFlight: false,
      pendingRequest: false,
    });
  },
}));
