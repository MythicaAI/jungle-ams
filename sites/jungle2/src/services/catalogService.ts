import axios from 'axios';
import type {UploadAssetListResponse} from '~/types/apiTypes'

export const CatalogService = {
    getAll: async () : Promise<UploadAssetListResponse> => {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5555';
        const CATALOG_PATH = 'api/v1/catalog/all'
        try {
            const response = await axios.get<UploadAssetListResponse>(`${API_URL}/${CATALOG_PATH}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Handle Axios-specific errors here
                console.error('Axios error:', error.message);
                throw new Error('An error occurred while fetching the user data');
            } else {
                // Handle non-Axios errors here
                console.error('Unknown error:', error);
                throw new Error('An unknown error occurred');
            }
        }
    }
};