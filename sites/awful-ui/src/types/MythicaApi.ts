export type Profile =  {
    profile_id: string,
    name: string,
    description: string,
    email: string,
    signature: string,
    profile_base_href: string,
    active: boolean,
    created: string,
    updated: string,
    validate_state: string,
}
export type AuthResponse = {
    token: string,
    profile: Profile,
    roles: string[],
}

export type GetFileResponse = {
    file_id: string,
    file_name: string,
    size: number,
    content_hash: string,
    owner_id?: string,
    content_type?: string,
    event_ids?: string[],
    created?: string
}   


export type GetAssetTagResponse = {
    name: string,
    tag_id: string,
}

export type GetAssetResponse = {
    asset_id: string,
    owner_id: string,
    owner_name: string,
    org_id: string,
    org_name: string,
    package_id: string,
    author_id: string,
    author_name: string,
    name: string,
    description: string,
    blurb: string,
    published:false,
    version:[number],
    commit_ref: string,
    created: string,
    contents: {
        files: [GetFileResponse],
        thumbnails: [GetAssetTagResponse],
    },
    tags: [GetAssetTagResponse],
}

export type GetDownloadInfoResponse = {
    file_id: string,
    owner_id: string,
    name: string,
    size: number,
    content_type: string,
    content_hash: string,
    url: string
}

export type UploadFileResponse = {
    message: string,
    files: GetFileResponse[]
  }