// src/context/AuthContext.tsx

import {createContext, useContext} from 'react';
import { GetDownloadInfoResponse, GetFileResponse, Profile, UploadFileResponse } from '../types/MythicaApi';

type MythicaApiContextType = {
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  authToken: string;
  profile?: Profile;
  getFile: (fileId: string) => Promise<GetFileResponse>;
  getDownloadInfo: (fileId: string) => Promise<GetDownloadInfoResponse>;
  uploadFile: (formData: FormData) => Promise<UploadFileResponse>;
};

export const MythicaApiContext = createContext<MythicaApiContextType | undefined>(undefined);



const useMythicaApi = () => {
  const context = useContext(MythicaApiContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useMythicaApi;