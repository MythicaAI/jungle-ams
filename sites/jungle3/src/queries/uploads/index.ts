import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@services/api";
import { UploadsApiPath, UploadsQuery } from "./enums";
import { FileUploadResponse } from "types/apiTypes";

export const useGetPendingUploads = () => {
  return useQuery<FileUploadResponse[]>({
    queryKey: [UploadsQuery.PENDING_LiST],
    queryFn: async () =>
      await api.get({
        path: `${UploadsApiPath.UPLOAD}${UploadsApiPath.PENDING}`,
      }),
  });
};

export const useDeleteUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await api.del({
        path: `${UploadsApiPath.FILES}/${id}`,
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [UploadsQuery.PENDING_LiST] });
    },
  });
};
