import {create} from "zustand";

interface AssetSummary {
  name: string;
  author: string;
  version: number[];
  package: string;
  updated_at: string;
}

interface AssetNavigation {
  page: number;
  page_size: number;
  cursor: string;
  assets: AssetSummary[];

  nextPage?: () => void;
  prevPage?: () => void;
  setPageSize?: (page_size: number) => void;
  setAssets?: (assets: AssetSummary[]) => void;
}

const defaultAssetNavigation: AssetNavigation = {
  page: 0,
  page_size: 20,
  cursor: '',
  assets: [],
}

export const useAssetNavStore = create<AssetNavigation>((set) => ({
    ...defaultAssetNavigation,
    nextPage: () => set((state) => ({page: (state.page + 1)})),
    prevPage: () => set((state) => ({page: Math.min(state.page - 1, 0)})),
    setPageSize: (page_size: number) => set((state) => ({page: state.page_size = page_size})),
    setAssets: (assets: AssetSummary[]) => set(() => ({assets: assets})),
}))