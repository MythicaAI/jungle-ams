import { create } from "zustand";
import { FileUploadResponse } from "types/apiTypes.ts";

export enum UploadProgressState {
  None,
  InProgress,
  Finished,
}

export interface FileUploadStatus extends FileUploadResponse {
  progress: number;
}

export type FileUploadMap = {
  [key: string]: FileUploadStatus;
};

export type FileObj = {
  file: File;
  tag: string;
  customTag: string;
  id: string;
};

export interface UploadState {
  // pendingUploads: File[];
  pendingUploads: FileObj[];
  uploads: FileUploadMap;
  progress: number;
  progressState: UploadProgressState;

  setPendingUploads: (files: FileObj[]) => void;
  setUploadProgress: (progress: number) => void;
  trackUpload: (upload: FileUploadStatus) => void;
  trackUploads: (uploads: FileUploadStatus[]) => void;
  updateUpload: (file_id: string, progress: number) => void;
}

const addUpload = (
  uploads: FileUploadMap,
  upload: FileUploadStatus,
): FileUploadMap => {
  return {
    ...uploads,
    [upload.file_id]: upload,
  };
};

const addUploads = (
  uploads: FileUploadMap,
  newUploads: FileUploadStatus[],
): FileUploadMap => {
  return {
    ...uploads,
    ...newUploads.reduce<{ [key: string]: FileUploadStatus }>((acc, obj) => {
      acc[obj.file_id] = obj;
      return acc;
    }, {}),
  };
};

const updateUpload = (
  uploads: FileUploadMap,
  file_id: string,
  progress: number,
): FileUploadMap => {
  const existing = uploads[file_id];
  if (!existing) {
    return uploads;
  }
  uploads[file_id] = {
    ...existing,
    progress: progress,
  };
  return uploads;
};

export const createUploadMap = (files: FileUploadResponse[]): FileUploadMap => {
  return files.reduce<{ [file_id: string]: FileUploadStatus }>((acc, obj) => {
    acc[obj.file_id] = obj as FileUploadStatus;
    return acc;
  }, {});
};

export const useUploadStore = create<UploadState>((set) => ({
  uploads: {},
  pendingUploads: [],
  progress: 0,
  progressState: UploadProgressState.None,

  setPendingUploads: (files: FileObj[]) =>
    set(() => ({ pendingUploads: files })),
  setUploadProgress: (progress: number) =>
    set((state) => {
      let progressState = UploadProgressState.InProgress;
      let pendingUploads = state.pendingUploads;
      if (progress == 0) {
        progressState = UploadProgressState.None;
      } else if (progress == 100) {
        progressState = UploadProgressState.Finished;
        pendingUploads = [];
      }
      return {
        progress: progress,
        progressState: progressState,
        pendingUploads: pendingUploads,
      };
    }),
  trackUpload: (file: FileUploadStatus) =>
    set((state) => ({ uploads: addUpload(state.uploads, file) })),
  trackUploads: (files: FileUploadStatus[]) =>
    set((state) => ({ uploads: addUploads(state.uploads, files) })),
  updateUpload: (file_id: string, progress: number) =>
    set((state) => ({
      uploads: updateUpload(state.uploads, file_id, progress),
    })),
}));
