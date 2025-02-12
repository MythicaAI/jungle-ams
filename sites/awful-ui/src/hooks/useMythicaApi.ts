// src/context/AuthContext.tsx

import { createContext, useContext } from 'react';
import {
  GetAssetResponse,
  GetDownloadInfoResponse,
  GetFileResponse,
  Profile,
  UploadFileResponse,
} from '../types/MythicaApi';

type MythicaApiContextType = {
  authToken: string;
  profile?: Profile;
  getFile: (fileId: string) => Promise<GetFileResponse>;
  getFiles: () => Promise<GetFileResponse[]>;
  getAssets: () => Promise<GetAssetResponse[]>;
  getDownloadInfo: (fileId: string) => Promise<GetDownloadInfoResponse>;
  uploadFile: (formData: FormData) => Promise<UploadFileResponse>;
  deleteFile: (fileId: string) => Promise<void>;
};

export const MythicaApiContext = createContext<
  MythicaApiContextType | undefined
>(undefined);

const useMythicaApi = () => {
  const context = useContext(MythicaApiContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useMythicaApi;
