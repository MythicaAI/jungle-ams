import {create} from 'zustand';
import {ResolvedOrgRef} from "../types/apiTypes.ts";
import {Profile} from "../schema_types/profiles.ts";

const defaultProfile: Profile = {
  id: '',
    name: '',
    full_name: '',
    signature: '',
    created: '',
    updated: '',
    active: false,
    profile_base_href: '',
    description: '',
    email:  '',
    email_validate_state: 0,
    location: '',
    login_count: 0,
}

interface GlobalState {
  authToken: string;
  refreshToken: string;
  isLoggedIn: boolean;

  profile: Profile,
  orgRoles: ResolvedOrgRef[];

  setAuthToken: (token: string) => void;
  setProfile: (profile: Profile) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  setOrgRoles: (roles: ResolvedOrgRef[]) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  isLoggedIn: false,
  authToken: '',
  refreshToken: '',

  profile: defaultProfile,
  orgRoles: [],

  setAuthToken: (authToken: string) => set( {authToken: authToken, isLoggedIn: authToken !== '' }),
  setRefreshToken: (refreshToken: string) => set( {refreshToken: refreshToken}),
  setProfile: (profile: Profile) => {
    set({profile: profile})
  },
  setOrgRoles: (roles) => set({orgRoles: roles}),
  updateProfile: (partial: Partial<Profile>) => {
    set((state) => ({profile: {...state.profile, ...partial}}))
  },
}));
