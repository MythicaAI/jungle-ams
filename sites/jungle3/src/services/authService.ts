import { getData } from './backendCommon';
import { UploadAssetListResponse } from '../types/apiTypes';

export const CatalogService = {
    getAll: async () : Promise<UploadAssetListResponse> => {
        const data = getData<UploadAssetListResponse>('catalog/all');
        return data;
    }
};