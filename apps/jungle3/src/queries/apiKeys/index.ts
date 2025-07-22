import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@services/api";
import { ApiKeysApiPath, ApiKeysQuery } from "./enums";

export type Key = {
  created: string;
  description: string;
  expires: string;
  name: string;
  value: string;
  is_expired: boolean;
};

export const useGetApiKeys = () => {
  return useQuery<Key[]>({
    queryKey: [ApiKeysQuery.KEYS_LIST],
    queryFn: async () =>
      await api.get({
        path: `${ApiKeysApiPath.KEYS}`,
      }),
  });
};

export const useAddApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceFormData: {
      name: string;
      description: string;
      expires?: string;
    }) =>
      await api.post({
        path: `${ApiKeysApiPath.KEYS}`,
        body: sourceFormData,
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [ApiKeysQuery.KEYS_LIST] });
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyValue: string) =>
      await api.del({
        path: `${ApiKeysApiPath.KEYS}/${keyValue}`,
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [ApiKeysQuery.KEYS_LIST] });
    },
  });
};
