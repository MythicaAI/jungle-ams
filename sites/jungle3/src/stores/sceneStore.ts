import { create } from "zustand";

// Parameter Schema Types
export interface ParameterSlider {
  type: 'slider';
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface ParameterHidden {
  type: 'hidden';
  default: any;
}

export type ParameterConfig = ParameterSlider | ParameterHidden;

// HDA Schema Type
export interface HDASchema {
  name: string;
  file_path: string;
  material_name: string;
  parameters: {
    [key: string]: ParameterConfig;
  };
}

// Mesh data type
export interface MeshData {
  points: number[];
  indices: number[];
  normals?: number[];
  uvs?: number[];
}

// WebSocket status
export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

// Store interface
interface SceneState {
  // HDA schemas and selection
  hdaSchemas: HDASchema[];
  selectedHdaIndex: number;
  setSelectedHdaIndex: (index: number) => void;

  // Parameter values
  paramValues: {[key: string]: any};
  updateParam: (key: string, value: any) => void;
  resetParams: () => void;

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

// Define the parameter schemas from the test client
const parameterSchemas: HDASchema[] = [
  {
    name: 'Crystal',
    file_path: 'assets/mythica.crystal.1.0.hda',
    material_name: 'crystal',
    parameters: {
      length: {
        type: 'slider',
        label: 'Length',
        min: 0.5,
        max: 5,
        step: 0.1,
        default: 2.5
      },
      radius: {
        type: 'slider',
        label: 'Radius',
        min: 0.1,
        max: 2,
        step: 0.1,
        default: 0.6
      },
      numsides: {
        type: 'slider',
        label: 'Sides',
        min: 3,
        max: 12,
        step: 1,
        default: 6
      }
    }
  },
  {
    name: 'Rock Generator',
    file_path: 'assets/Mythica.RockGenerator.1.0.hda',
    material_name: 'rock',
    parameters: {
      seed: {
        type: 'slider',
        label: 'Randomize',
        min: 0,
        max: 100,
        step: 1,
        default: 0,
      },
      smoothing: {
        type: 'slider',
        label: 'Smoothing',
        min: 0,
        max: 50,
        step: 1,
        default: 25
      },
      flatten: {
        type: 'slider',
        label: 'Flatten',
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.3
      },
      npts: {
        type: 'hidden',
        default: 5
      }
    },
  },
  {
    name: 'Rockify',
    file_path: 'assets/Mythica.Rockify.1.0.hda',
    material_name: 'rockface',
    parameters: {
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
  }
];

// Initialize default parameter values
const initParamValues = (schemaIndex: number) => {
  const params: {[key: string]: any} = {};
  const schema = parameterSchemas[schemaIndex];

  Object.entries(schema.parameters).forEach(([key, config]) => {
    params[key] = config.default;
  });

  return params;
};

export const useSceneStore = create<SceneState>((set, get) => ({
  // HDA schemas and selection
  hdaSchemas: parameterSchemas,
  selectedHdaIndex: 2, // Default to Rockify
  setSelectedHdaIndex: (index) => {
    set({
      selectedHdaIndex: index,
      paramValues: initParamValues(index)
    });
  },

  // Parameter values
  paramValues: initParamValues(2), // Initialize with Rockify parameters
  updateParam: (key, value) => set((state) => ({
    paramValues: { ...state.paramValues, [key]: value }
  })),
  resetParams: () => set((state) => ({
    paramValues: initParamValues(state.selectedHdaIndex)
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
  reset: () => {
    const state = get();
    set({
      paramValues: initParamValues(state.selectedHdaIndex),
      meshData: null,
      isWireframe: false,
      showLogWindow: false,
      generateTime: "0",
      statusLog: [],
      exportFormat: null,
      requestInFlight: false,
      pendingRequest: false
    });
  }
}));
