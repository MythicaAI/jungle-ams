
type ApiResponse<T> = {
      message: string,
      data: T,
}

export type UploadAsset = {
      bucket_name: string,
      content_hash: string,
      created_at: string,
      file_name: string,
      file_type: string,
      id: number,
      object_name: string,
      size: number,
      status: string,
      updated_at: string,
      uploaded_by: string,
}

export type UploadAssetList = Array<UploadAsset>;

// current placeholder result from the /api/v1/catalog/* APIs
// will be migrating to a catalog asset
export type UploadAssetListResponse = ApiResponse<UploadAssetList>