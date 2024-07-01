import {create} from "zustand";
import {AssetVersionContent, AssetVersionContentMap} from "../types/apiTypes.ts";

interface AssetVersion {
    asset_id: string;
    org_id: string;
    owner: string;
    author: string;
    package_id: string;
    name: string;
    description: string;
    published: boolean;
    commit_ref: string;
    version: number[];
    created: string;
    updated: string;
    files: AssetVersionContentMap;
    thumbnails: AssetVersionContentMap;
    links: string[];

    addFile: (file: AssetVersionContent) => AssetVersionContentMap;
    addFiles: (files: AssetVersionContent[]) => AssetVersionContentMap;
    removeFile: (file_id: string) => AssetVersionContentMap;
    addThumbnail: (file: AssetVersionContent) => AssetVersionContentMap;
    addThumbnails: (files: AssetVersionContent[]) => AssetVersionContentMap;
    removeThumbnail: (file_id: string) => AssetVersionContentMap;
    updateVersion: (update: Partial<AssetVersion>) => void;
    clearVersion: () => void;
}

const defaultAssetVersion: Partial<AssetVersion> = {
    asset_id: '',
    org_id: '',
    owner: '',
    author: '',
    package_id: '',
    name: '',
    description: '',
    published: false,
    commit_ref: '',
    version: [0, 0, 0],
    files: {},
    thumbnails: {},
    links: [],
}
function createInstance<T>(defaultValues: Partial<T>): (overrides?: Partial<T>) => T {
    return (overrides: Partial<T> = {}) => {
        return { ...defaultValues, ...overrides } as T;
    };
}

const addFile = (file: AssetVersionContent, map: AssetVersionContentMap): AssetVersionContentMap => {
    return {...map, [file.file_id]: file}
}

const addFiles = (files: AssetVersionContent[], map: AssetVersionContentMap): AssetVersionContentMap => {
    return {...map, ...files.reduce<{ [key: string]: AssetVersionContent }>(
        (acc, obj) => {
            acc[obj.file_id] = obj;
            return acc;
        }, {})}
}

const removeFile = (file_id: string, map: AssetVersionContentMap): AssetVersionContentMap => {
    const newMap = {...map}
    delete newMap[file_id];
    return newMap
}

export const useAssetVersionStore = create<AssetVersion>((set, get) => ({
    ...createInstance<AssetVersion>(defaultAssetVersion)(),

    addFile: (file: AssetVersionContent) => {
        set((state) => ({files: addFile(file, state.files)}));
        return get().files;
    },
    addFiles: (files: AssetVersionContent[]) => {
        set((state) => ({files: addFiles(files, state.files)}));
        return get().files;
    },
    removeFile: (file_id: string) => {
        set((state) => ({files: removeFile(file_id, state.files)}));
        return get().files;
    },
    addThumbnail: (file: AssetVersionContent) => {
        set((state) => ({thumbnails: addFile(file, state.thumbnails)}));
        return get().thumbnails;
    },
    addThumbnails: (files: AssetVersionContent[]) => {
        set((state) => ({thumbnails: addFiles(files, state.thumbnails)}));
        return get().thumbnails;
    },
    removeThumbnail: (file_id: string) => {
        set((state) => ({thumbnails: removeFile(file_id, state.thumbnails)}));
        return get().thumbnails;
    },

    updateVersion: (update: Partial<AssetVersion>) => set(
        (state) => ({...state, ...update})),

    clearVersion: () => set(
        (state) => ({...state, ...defaultAssetVersion})),
}));