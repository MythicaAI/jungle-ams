import { create } from "zustand";
import { ResolvedOrgRef, ProfileResponse } from "types/apiTypes.ts";

const defaultProfile: ProfileResponse = {
  profile_id: "",
  name: "",
  full_name: "",
  signature: "",
  created: "",
  updated: "",
  active: false,
  profile_base_href: "",
  description: "",
  email: "",
  email_verified: false,
  org_roles: [],
};

interface GlobalState {
  authToken: string;
  refreshToken: string;
  isLoggedIn: boolean;

  profile: ProfileResponse;
  orgRoles: ResolvedOrgRef[];
  isOrgRolesLoading: boolean;

  setAuthToken: (token: string) => void;
  setProfile: (profile: ProfileResponse) => void;
  updateProfile: (profile: Partial<ProfileResponse>) => void;
  setOrgRoles: (roles: ResolvedOrgRef[]) => void;
  clearAll: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  isLoggedIn: false,
  authToken: "",
  refreshToken: "",

  profile: defaultProfile,
  orgRoles: [],
  isOrgRolesLoading: true,

  setAuthToken: (authToken: string) =>
    set({ authToken: authToken, isLoggedIn: authToken !== "" }),
  setRefreshToken: (refreshToken: string) =>
    set({ refreshToken: refreshToken }),
  setProfile: (profile: ProfileResponse) => {
    set({ profile: profile });
  },
  setOrgRoles: (roles) => set({ orgRoles: roles, isOrgRolesLoading: false }),
  updateProfile: (partial: Partial<ProfileResponse>) => {
    set((state) => ({ profile: { ...state.profile, ...partial } }));
  },
  clearAll: () =>
    set({
      isLoggedIn: false,
      authToken: "",
      refreshToken: "",
      profile: defaultProfile,
      orgRoles: [],
    }),
}));
