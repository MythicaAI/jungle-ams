export interface Profile {
  id: string;
  name: string;
  created: Date;
  updated: Date;
  active: boolean;
  tags: Record<string, any>;
  base_href: string;
  description: string;
  email_verified: boolean;
  location: string;
  login_count: number;
}

export interface Orgref {
  id: number;
  profile_id: string;
  org_id: string;
  role: string;
}

export interface Org {
  id: string;
  name: string;
  description: string;
  tags: Record<string, any>;
}

export interface Profilesession {
  id: string;
  profile_id: string;
  authenticated: boolean;
  started: Date;
  updated: Date;
}

export interface Profileauth {
  id: number;
  profile_id: string;
  auth_token: string;
  refresh_token: string;
}

export interface Profilefollower {
  id: number;
  profile_id: string;
  following_id: string;
  created: Date;
  deleted: Date;
}

export interface Topology {
  id: number;
  name: string;
}

export interface Assetref {
  id: number;
  src_asset_id: string;
  dst_asset_id: string;
  edge_data: Record<string, any>;
  topology_id: number;
}

export interface Media {
  id: string;
  content_type: string;
  uri: string;
  external: boolean;
  cache_ttl: number;
  content_hash: string;
}

export interface Mediapipeline {
  id: string;
  owner_id: string;
  queued: Date;
  job_data: Record<string, any>;
  location: string;
}

export interface Asset {
  id: string;
  created: Date;
  updated: Date;
  deleted: Date;
  col_asset_id: string;
  owner_id: string;
}

export interface Assetversion {
  id: number;
  asset_id: string;
  major: number;
  minor: number;
  patch: number;
  content_hash: string;
  friendly_name: string;
  tags: Record<string, any>;
  author_id: string;
}export interface Profile {
  id: string;
  name: string;
  created: Date;
  updated: Date;
  active: boolean;
  tags: Record<string, any>;
  base_href: string;
  description: string;
  email_verified: boolean;
  location: string;
  login_count: number;
}

export interface Orgref {
  id: number;
  profile_id: string;
  org_id: string;
  role: string;
}

export interface Org {
  id: string;
  name: string;
  description: string;
  tags: Record<string, any>;
}

export interface Profilesession {
  id: string;
  profile_id: string;
  authenticated: boolean;
  started: Date;
  updated: Date;
}

export interface Profileauth {
  id: number;
  profile_id: string;
  auth_token: string;
  refresh_token: string;
}

export interface Profilefollower {
  id: number;
  profile_id: string;
  following_id: string;
  created: Date;
  deleted: Date;
}

export interface Topology {
  id: number;
  name: string;
}

export interface Assetref {
  id: number;
  src_asset_id: string;
  dst_asset_id: string;
  edge_data: Record<string, any>;
  topology_id: number;
}

export interface Media {
  id: string;
  content_type: string;
  uri: string;
  external: boolean;
  cache_ttl: number;
  content_hash: string;
}

export interface Mediapipeline {
  id: string;
  owner_id: string;
  queued: Date;
  job_data: Record<string, any>;
  location: string;
}

export interface Asset {
  id: string;
  created: Date;
  updated: Date;
  deleted: Date;
  col_asset_id: string;
  owner_id: string;
}

export interface Assetversion {
  id: number;
  asset_id: string;
  major: number;
  minor: number;
  patch: number;
  content_hash: string;
  friendly_name: string;
  tags: Record<string, any>;
  author_id: string;
}