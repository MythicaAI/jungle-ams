import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@services/api";
import { TagsApiPath, TagsQuery, TagType } from "./enums";
import { Tag } from "./types";
import { AssetTopResponse } from "types/apiTypes";
import { PackagesQuery } from "@queries/packages/enums";

export const useGetAssetTags = () => {
  return useQuery<Tag[]>({
    queryKey: [TagsQuery.TAGS_LIST_ASSETS],
    queryFn: async () =>
      await api.get({
        path: `${TagsApiPath.TAGS}${TagsApiPath.TYPES}/${TagType.ASSET}`,
        query: {
          limit: 100,
        },
      }),
  });
};

export const useGetFileTags = () => {
  return useQuery<Tag[]>({
    queryKey: [TagsQuery.TAGS_LIST_FILES],
    queryFn: async () =>
      await api.get({
        path: `${TagsApiPath.TAGS}${TagsApiPath.TYPES}/${TagType.FILE}`,
        query: {
          limit: 100,
        },
      }),
  });
};

export const useGetAssetsByTags = (tag: string) => {
  return useQuery<AssetTopResponse[]>({
    queryKey: [TagsQuery.ASSETS_BY_TAG, tag],
    queryFn: async () =>
      await api.get({
        path: `${TagsApiPath.TAGS}${TagsApiPath.TYPES}/${TagType.ASSET}${TagsApiPath.FILTER}`,
        query: {
          limit: 100,
          include: tag,
        },
      }),
  });
};

export const useCreateAssetTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) =>
      await api.post({
        path: `${TagsApiPath.TAGS}`,
        body: {
          name,
        },
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [TagsQuery.TAGS_LIST_ASSETS] });
    },
  });
};

export const useCreateFileTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) =>
      await api.post({
        path: `${TagsApiPath.TAGS}`,
        body: {
          name,
        },
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [TagsQuery.TAGS_LIST_FILES] });
    },
  });
};

export const useAssignTagToAsset = () => {
  const queryClient = useQueryClient();
  let assetId = "";

  return useMutation({
    mutationFn: async (payload: { tag_id: string; type_id: string }) => {
      assetId = payload.type_id;
      return await api.post({
        path: `${TagsApiPath.TAGS}${TagsApiPath.TYPES}/${TagType.ASSET}`,
        body: {
          tag_id: payload.tag_id,
          type_id: payload.type_id,
        },
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [PackagesQuery.ASSETS, assetId],
      });
    },
  });
};

export const useAssignTagToFile = () => {
  const queryClient = useQueryClient();
  let assetId = "";

  return useMutation({
    mutationFn: async (payload: { tag_id: string; type_id: string }) => {
      assetId = payload.type_id;
      return await api.post({
        path: `${TagsApiPath.TAGS}${TagsApiPath.TYPES}/${TagType.FILE}`,
        body: {
          tag_id: payload.tag_id,
          type_id: payload.type_id,
        },
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [PackagesQuery.ASSETS, assetId],
      });
    },
  });
};

export const useRemoveTagFromAsset = () => {
  const queryClient = useQueryClient();
  let assetId = "";

  return useMutation({
    mutationFn: async (payload: { tag_id: string; type_id: string }) => {
      assetId = payload.type_id;
      return await api.del({
        path: `${TagsApiPath.TAGS}${TagsApiPath.TYPES}/${TagType.ASSET}/${payload.tag_id}/${payload.type_id}`,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [PackagesQuery.ASSETS, assetId],
      });
    },
  });
};

export const useRemoveTagFromFile = () => {
  const queryClient = useQueryClient();
  let assetId = "";

  return useMutation({
    mutationFn: async (payload: { tag_id: string; type_id: string }) => {
      assetId = payload.type_id;
      return await api.del({
        path: `${TagsApiPath.TAGS}${TagsApiPath.TYPES}/${TagType.FILE}/${payload.tag_id}/${payload.type_id}`,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [PackagesQuery.ASSETS, assetId],
      });
    },
  });
};
