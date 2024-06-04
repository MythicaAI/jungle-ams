import create from 'zustand';

interface GlobalState {
  isLoggedIn: boolean;
  userRole: string;
  setLoggedIn: (loggedIn: boolean) => void;
  setUserRole: (role: string) => void;
}

const useGlobalStore = create<GlobalState>((set) => ({
  isLoggedIn: false,
  userRole: '',
  setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
  setUserRole: (role) => set({ userRole: role }),
}));

export default useGlobalStore;