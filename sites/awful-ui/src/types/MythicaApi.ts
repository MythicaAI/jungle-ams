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
    owner_id: string,
    file_name: string,
    event_ids: string[],
    size: number,
    content_type: string,
    content_hash: string,
    created: string
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