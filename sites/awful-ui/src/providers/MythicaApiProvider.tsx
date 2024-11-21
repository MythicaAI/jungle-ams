// src/context/AuthContext.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {MythicaApiContext} from '../hooks/useMythicaApi';
import axios from 'axios';

import { Profile, GetDownloadInfoResponse, GetFileResponse, UploadFileResponse } from '../types/MythicaApi';

const BASE_URL = '/mythica-api';



const MythicaApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize apiKey with value from localStorage if it exists
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('apiKey') || '';  // Retrieve apiKey from localStorage
  });
  
  const [authToken, setAuthToken] = useState<string>('');
  const [profile, setProfile] = useState<Profile>();

  // Fetch the full authentication response using the API key
  const authenticate = useCallback(async () => {
    const response = await axios.get(`${BASE_URL}/sessions/key/${apiKey}`);
    setAuthToken(response.data.token); // Return the full response data
    setProfile(response.data.profile);
  }, [apiKey]);

  // Update localStorage whenever apiKey changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);  // Store apiKey in localStorage
      authenticate();  // Fetch the full authentication response
    } else {
      localStorage.removeItem('apiKey');  // Remove it if apiKey is cleared
    }
  }, [apiKey, authenticate]);

  // Define the type for the authentication response


  const getFile = async (fileId: string):Promise<GetFileResponse> => {
    const response = await axios.get(`${BASE_URL}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
  };

  // Function to fetch the URL key from the special VITE middleware
  const getUrlKey = async (url: string) => {
    const res = await fetch(`/gcs-keys${url}`);
    const key = await res.text();
    return key; // Return the key directly
  }

  const getDownloadInfo = async (fileId: string):Promise<GetDownloadInfoResponse> => {
    const response = await axios.get(`${BASE_URL}/download/info/${fileId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    const src = response.data.url;
    const encodedSrc = `${new URL(src).pathname}${new URL(src).search}`;
    response.data.url = `/${await getUrlKey(encodedSrc)}`;
    return response.data; // Return the URL for downloading
  };

  const uploadFile = async (formData: FormData):Promise<UploadFileResponse> => {
    const response = await axios.post(`${BASE_URL}/upload/store`, formData, {
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data; // Return the file data response
  };

  return (
    <MythicaApiContext.Provider 
      value={{ 
        setApiKey, 
        apiKey, 
        authToken, 
        profile,
        getFile, 
        getDownloadInfo, 
        uploadFile
      }}
    >
      {children}
    </MythicaApiContext.Provider>
  );
};

export default MythicaApiProvider;