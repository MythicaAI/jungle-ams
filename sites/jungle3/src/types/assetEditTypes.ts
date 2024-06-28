

export interface UploadPendingListState {
    open: boolean;
    category?: string;
}

export interface OpenUploadsState {
    open: boolean,
    opened: boolean,
    category?: string,
    fileTypeFilters?: string[]
}

 // version sanitation helper
export const sanitizeVersion = (version: number[]): number[] => {
    let sanitized: number[] = [0, 0, 0]
    if (!version) {
        return sanitized;
    }
    sanitized = version;
    if (sanitized.length > 3) {
        sanitized = sanitized.slice(0, 3);
    }
    while (sanitized.length < 3) {
        sanitized.push(0);
    }
    // console.log("version:", version, "sanitized:", sanitized);
    return sanitized;
}

 // convert a user version string to a number array
export const convertUserVersion = (v: string): number[] => {
    return v
        .split('.')
        .map(v => parseInt(v, 10))
        .filter(v => !isNaN(v));
}

// zero versions can be used for asset roots cannot be used to create new versions
export const isVersionZero = (version: number[]): boolean => {
    return version.every((v) => v === 0)
}