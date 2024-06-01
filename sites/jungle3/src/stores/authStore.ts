import 'zustand';
import create, {StateCreator} from "zustand";
import {persist, createJSONStorage, PersistOptions} from "zustand/middleware";
// import { persist } from 'zustand/middleware';
// import {PersistOptions} from "zustand/middleware";

interface AuthState {
  user_id: string;
  auth_token: string;
  refresh_token: string;
}
  
const login = (username: string, password: string) => {
  console.log("logging in");
  
}

const logout = () => {
  console.log("logging out");
}
  


export default useAuthStore;