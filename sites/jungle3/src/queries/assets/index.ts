import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { AssetTopResponse } from "../../types/apiTypes";
import { AssetsApiPath, AssetsQuery } from "./enums";

export const useGetAllAssets = () => {
  return useQuery<AssetTopResponse[]>({
    queryKey: [AssetsQuery.ALL],
    queryFn: async () =>
      await api.get({
        path: `${AssetsApiPath.ASSETS}${AssetsApiPath.ALL}`,
      }),
  });
};

export const useGetTopAssets = () => {
  return useQuery<AssetTopResponse[]>({
    queryKey: [AssetsQuery.TOP],
    queryFn: async () =>
      await api.get({
        path: `${AssetsApiPath.ASSETS}${AssetsApiPath.TOP}`,
      }),
  });
};
