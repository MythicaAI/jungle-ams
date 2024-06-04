import create from 'zustand';
import useGlobalStore from './globalStore';

interface UserState {
  userDetails: Record<string, any>;
  setUserDetails: (details: Record<string, any>) => void;
}

const useUserStore = create<UserState>((set) => ({
  userDetails: {},
  setUserDetails: (details) => set({ userDetails: details }),
}));

// Example of accessing global store
const globalState = useGlobalStore.getState();
if (globalState.isLoggedIn) {
  // Perform actions based on global state
}

export default useUserStore;