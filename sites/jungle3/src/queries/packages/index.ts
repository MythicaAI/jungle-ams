import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@services/api";
import { PackagesApiPath, PackagesQuery } from "./enums";
import { AssetCreateRequest, AssetVersionResponse } from "types/apiTypes";

export const useGetOwnedPackages = () => {
  return useQuery<AssetVersionResponse[]>({
    queryKey: [PackagesQuery.OWNED],
    queryFn: async () =>
      await api.get({
        path: `${PackagesApiPath.OWNED}`,
      }),
  });
};

export const usePublishToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      asset_id,
      version,
      published,
    }: {
      asset_id: string;
      version: string;
      published: boolean;
    }) =>
      await api.post({
        path: `/assets/${asset_id}/versions/${version}`,
        body: {
          published,
        },
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [PackagesQuery.OWNED] });
    },
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (createRequest: AssetCreateRequest) =>
      await api.post({
        path: "/assets",
        body: createRequest,
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [PackagesQuery.OWNED] });
    },
  });
};

export const useGetAssetByVersion = (id?: string, version?: string) => {
  return useQuery<AssetVersionResponse>({
    queryKey: [PackagesQuery.ASSETS, id],
    queryFn: async () =>
      await api.get({
        path: `${PackagesApiPath.ASSETS}/${id}${PackagesApiPath.VERSIONS}/${version}`,
      }),
    enabled: !!(id && version),
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  let assetId = "";

  return useMutation({
    mutationFn: async (updateRequest: {
      payload: { [key: string]: string | object };
      assetId: string;
      assetVersion: string;
    }) => {
      assetId = updateRequest.assetId;
      return await api.post({
        path: `${PackagesApiPath.ASSETS}/${updateRequest.assetId}${PackagesApiPath.VERSIONS}/${updateRequest.assetVersion}`,
        body: updateRequest.payload,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [PackagesQuery.ASSETS, assetId],
      });
      queryClient.invalidateQueries({ queryKey: [PackagesQuery.OWNED] });
    },
  });
};
