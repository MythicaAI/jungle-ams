// src/context/AuthContext.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { MythicaApiContext } from '../hooks/useMythicaApi';
import axios from 'axios';

import {
  Profile,
  GetDownloadInfoResponse,
  GetFileResponse,
  UploadFileResponse,
  GetAssetResponse,
} from '../types/MythicaApi';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = import.meta.env.VITE_MYTHICA_API_URL;

const MythicaApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cookies = new Cookies();

  const authToken = cookies.get('auth_token');
  const decodedToken: { profile_id: string } = jwtDecode(authToken);

  const [profile, setProfile] = useState<Profile>();

  const getProfile = useCallback(async () => {
    const response = await axios.get(
      `${BASE_URL}/profiles/${decodedToken.profile_id}`
    );
    setProfile(response.data);
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      getProfile();
    }
  }, [authToken, getProfile]);

  const getFile = async (fileId: string): Promise<GetFileResponse> => {
    const response = await axios.get(`${BASE_URL}/files/${fileId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  };

  const getFiles = async (): Promise<GetFileResponse[]> => {
    const response = await axios.get(`${BASE_URL}/upload/pending`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  };

  const getAssets = async (): Promise<GetAssetResponse[]> => {
    const response = await axios.get(`${BASE_URL}/assets/all`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  };

  const getDownloadInfo = async (
    fileId: string
  ): Promise<GetDownloadInfoResponse> => {
    const response = await axios.get(`${BASE_URL}/download/info/${fileId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const src = response.data.url;
    response.data.url = `/gcs-files_${new URL(src).pathname.split('/').pop()}`;

    return response.data; // Return the URL for downloading
  };

  const uploadFile = async (
    formData: FormData
  ): Promise<UploadFileResponse> => {
    const response = await axios.post(`${BASE_URL}/upload/store`, formData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Return the file data response
  };
  const deleteFile = async (fileId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/files/${fileId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  };

  return (
    <MythicaApiContext.Provider
      value={{
        authToken,
        profile,
        getFile,
        getFiles,
        getAssets,
        getDownloadInfo,
        uploadFile,
        deleteFile,
      }}
    >
      {children}
    </MythicaApiContext.Provider>
  );
};

export default MythicaApiProvider;
