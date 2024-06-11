import {create} from 'zustand';
import {FileContent} from '../schema_types/media'
import {ResolvedOrgRef} from "../types/apiTypes.ts";
import {Profile} from "../schema_types/profiles.ts";

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

const defaultProfile: Profile = {}

interface GlobalState {
  authToken: string;
  refreshToken: string;
  isLoggedIn: boolean;

  profile: Profile,
  orgRoles: ResolvedOrgRef[];
  assetCreation: AssetCreation;
  assetNavigation: AssetNavigation;

  setAuthToken: (token: string) => void;
  setProfile: (profile: Profile) => void;
  setOrgRoles: (roles: ResolvedOrgRef[]) => void;
  setAssetNavigation: (navigation: AssetNavigation) => void;

  updateAssetCreation: (update: Partial<AssetCreation>) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  isLoggedIn: false,
  authToken: '',
  refreshToken: '',

  profile: defaultProfile,
  orgRoles: [],
  assetCreation: defaultAssetCreation,
  assetNavigation: defaultAssetNavigation,

  setAuthToken: (authToken: string) => set( {authToken: authToken, isLoggedIn: authToken !== '' }),
  setRefreshToken: (refreshToken: string) => set( {refreshToken: refreshToken}),
  setProfile: (profile: Profile) => set( {profile: profile}),
  setOrgRoles: (roles) => set({orgRoles: roles}),

  setAssetNavigation: (navigation: AssetNavigation) => set(
      {assetNavigation: navigation}),

  updateAssetCreation: (updates: Partial<AssetCreation>) => set(
  (state) => ({assetCreation: {...state.assetCreation, ...updates}})
  ),
}));
