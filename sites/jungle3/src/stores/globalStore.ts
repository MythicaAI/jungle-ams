import {create} from 'zustand';
import {FileContent} from '../schema_types/media'

interface AssetSummary {
  name: string;
  author: string;
  version: number[];
  package: string;
  updated_at: string;
}

interface AssetNavigation {
  page: number;
  page_size: number;
  cursor: string;
  assets: AssetSummary[];
}

const defaultAssetNavigation: AssetNavigation = {
  page: 0,
  page_size: 20,
  cursor: '',
  assets: []
}

interface AssetCreation {
  asset_id: string;
  collection_id: string;
  name: string;
  description: string;
  commit_ref: string;
  version: number[];
  pendingFiles: FileContent[];
}

const defaultAssetCreation: AssetCreation = {
  asset_id: '',
  collection_id: '',
  name: '',
  commit_ref: '',
  version: [0, 0, 0],
  pendingFiles: []
}

interface GlobalState {
  isLoggedIn: boolean;
  userRole: string;
  authToken: string;
  refreshToken: string;

  assetCreation: AssetCreation;
  assetNavigation: AssetNavigation;

  setLoggedIn: (loggedIn: boolean) => void;
  setUserRole: (role: string) => void;
  setAuthToken: (token: string) => void;

  setAssetNavigation: (navigation: AssetNavigation) => void;

  updateAssetCreation: (update: Partial<AssetCreation>) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  isLoggedIn: false,
  userRole: '',
  authToken: '',
  refreshToken: '',

  assetCreation: defaultAssetCreation,
  assetNavigation: defaultAssetNavigation,

  setLoggedIn: (loggedIn) => set({isLoggedIn: loggedIn}),
  setUserRole: (role) => set({userRole: role}),
  setAuthToken: (authToken: string) => set( {authToken: authToken}),
  setRefreshToken: (refreshToken: string) => set( {refreshToken: refreshToken}),

  setAssetNavigation: (navigation: AssetNavigation) => set(
      {assetNavigation: navigation}),

  updateAssetCreation: (updates: Partial<AssetCreation>) => set(
  (state) => ({assetCreation: {...state.assetCreation, ...updates}})
  ),
}));
