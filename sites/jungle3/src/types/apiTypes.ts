export type API_ID = string;
export type ISOTime = string;

export type UploadAsset = {
  bucket_name: string;
  content_hash: string;
  created_at: string;
  file_name: string;
  file_type: string;
  id: number;
  object_name: string;
  size: number;
  status: string;
  updated_at: string;
  uploaded_by: string;
};

export type ProfileResponse = {
  profile_id: string;
  name: string;
  full_name: string;
  description: string;
  email: string;
  signature: string;
  profile_base_href: string;
  active: boolean;
  created: ISOTime;
  updated: ISOTime;
  validate_state: boolean;
  org_roles: { org_id: string; roles: string[] }[];
};

export type PublicProfileResponse = {
  profile_id: string;
  name: string;
  description: string;
  signature: string;
  profile_base_href: string;
  created: ISOTime;
};

export const defaultProfileResponse = () => {
  return {
    profile_id: "",
    name: "",
    full_name: "",
    description: "",
    email: "",
    signature: "",
    profile_base_href: "",
    active: false,
    created: "",
    updated: "",
    validate_state: false,
    org_roles: [],
  };
};

export interface ProfileSession {
  profile_session_id: API_ID;
  created: string;
  refreshed: string;
  profile_seq: number;
  authenticated: boolean;
  auth_token: string;
  refresh_token: string;
  location: string;
}

export interface SessionStartResponse {
  token: string;
  profile: ProfileResponse;
  sessions: ProfileSession;
}

export interface AssetCreateRequest {
  org_id?: API_ID;
}

export interface AssetCreateResponse {
  asset_id: API_ID;
  org_id: API_ID;
  owner_id: API_ID;
}

export interface AssetVersionContent {
  file_id: API_ID;
  file_name: string;
  content_hash: string;
  size: number;
}

export type AssetVersionContentMap = {
  [key: string]: AssetVersionContent;
};

export type AssetVersionContentListMap = {
  [key: string]: AssetVersionContent[];
};

export interface AssetVersionResponse {
  asset_id: API_ID;
  owner_id: API_ID;
  owner_name: string;
  org_id: API_ID;
  org_name: string;
  package_id: API_ID;
  author_id: API_ID;
  author_name: string;
  name: string;
  description: string;
  version: number[];
  commit_ref: string;
  published: boolean;
  created: ISOTime;
  updated: ISOTime;
  contents: AssetVersionContentListMap;
  tags: { tag_id: string; tag_name: string }[] | null;
}

export interface AssetTopResponse extends AssetVersionResponse {
  downloads: number;
  versions: [number[]];
}

export interface OrgResponse {
  org_id: API_ID;
  created: string;
  updated: string;
  name: string;
  description: string;
}

export interface ResolvedOrgRef {
  org_id: API_ID;
  org_name: string;
  profile_name: string;
  profile_id: API_ID;
  role: string;
  created: string;
  author_id: API_ID;
}

export type UploadAssetList = Array<UploadAsset>;

export interface FileUploadResponse {
  file_id: string;
  event_ids: string[];
  file_name: string;
  size: number;
  created: string;
  content_type: string;
  content_hash: string;
  download_url: string;
  tags: { tag_id: string; tag_name: string }[];
}

export interface FileInfoResponse {
  file_id: string;
  owner_id: string;
  name: string;
  size: number;
  content_type: string;
  content_hash: string;
  url: string;
}

export interface UploadResponse {
  message: string;
  files: FileUploadResponse[];
}

export interface DownloadInfoResponse {
  file_id: API_ID;
  name: string;
  size: number;
  content_type: string;
  content_hash: string;
  url: string;
}

export interface SessionStartAuth0Request {
  access_token: string;
  user_id: string;
}
