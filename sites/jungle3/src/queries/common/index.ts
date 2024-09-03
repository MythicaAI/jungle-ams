import { useQuery } from "@tanstack/react-query";
import { api } from "@services/api";
import { FileDownloadApiPath } from "./enums";

export const useDownloadFile = ({
  id,
  shouldDownload,
}: {
  id: string;
  shouldDownload: boolean;
}) => {
  return useQuery({
    queryKey: ["downloadFile", id],
    queryFn: async () =>
      await api.get({
        path: `${FileDownloadApiPath.DOWNLOAD}${FileDownloadApiPath.INFO}/${id}`,
      }),
    enabled: shouldDownload,
  });
};
