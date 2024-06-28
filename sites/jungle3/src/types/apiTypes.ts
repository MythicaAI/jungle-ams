import {OrgRef, ProfileSession} from "../schema_types/profiles.ts";
import {FileContent} from "../schema_types/media.ts";

type ApiResponse<T> = {
    message: string,
    data: T,
};

export type UUID = string;
export type ISOTime = string;

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
};

export type ProfileResponse = {
    id: UUID,
    name: string,
    full_name: string,
    description: string,
    email: string,
    signature: string,
    profile_base_href: string,
    active: boolean,
    created: ISOTime,
    updated: ISOTime,
    email_verified: boolean,
};

export const defaultProfileResponse = () => {
    return {
        id: '',
        name: '',
        full_name: '',
        description: '',
        email: '',
        signature: '',
        profile_base_href: '',
        active: false,
        created: '',
        updated: '',
        email_verified: false,
    };
}

export interface SessionStartResponse {
    token: string,
    profile: ProfileResponse,
    sessions: ProfileSession
}

export interface AssetCreateRequest {
    org_id?: UUID
}

export interface AssetCreateResponse {
    id: UUID,
    org_id: UUID,
    owner: UUID
}

export interface AssetCreateVersionRequest {
    author: UUID,
    name: string,
    commit_ref?: string,
    contents: UUID[]
}

export interface AssetVersionContent {
    file_id: UUID,
    file_name: string,
    content_hash: string,
    size: number,
}

export type AssetVersionContentMap = {
    [key: string]: AssetVersionContent
}

export type AssetVersionContentListMap = {
    [key: string]: AssetVersionContent[]
}

export interface AssetVersionResponse {
    asset_id: UUID,
    owner: UUID,
    owner_name: string,
    org_id: UUID,
    org_name: string
    package_id: UUID,
    author: UUID,
    author_name: string,
    name: string,
    description: string,
    version: number[],
    commit_ref: string,
    published: boolean
    created: ISOTime,
    updated: ISOTime,
    contents: AssetVersionContentListMap
}

export interface ResolvedOrgRef extends OrgRef {
    org_name: string,
    profile_name: string
}

export type UploadAssetList = Array<UploadAsset>;

// current placeholder result from the /api/v1/catalog/* APIs
// will be migrating to a catalog asset
export type UploadAssetListResponse = ApiResponse<UploadAssetList>

export interface FileUploadResponse {
    file_id: string,
    event_ids: string[],
    file_name: string,
    size: number,
    created: string,
    content_type: string,
    content_hash: string,
    download_url: string,
}

export interface UploadResponse {
    message: string,
    files: FileUploadResponse[],
}

export interface DownloadInfoResponse extends FileContent {
    url: string,
}