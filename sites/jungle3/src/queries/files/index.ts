import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { FileInfoResponse } from "../../types/apiTypes";
import { FilesApiPath, FilesQuery } from "./enums";

export const useGetFile = (id?: string) => {
  return useQuery<FileInfoResponse>({
    queryKey: [FilesQuery.DOWNLOAD_INFO, id],
    queryFn: async () =>
      await api.get({
        path: `${FilesApiPath.DOWNLOAD}${FilesApiPath.INFO}/${id}`,
      }),
    enabled: !!id,
  });
};
