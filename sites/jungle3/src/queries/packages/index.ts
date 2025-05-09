import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@services/api";
import { PackagesApiPath, PackagesQuery } from "./enums";
import { AssetCreateRequest, AssetVersionResponse } from "types/apiTypes";
import type { JobDefinition, JobDefinitionTemplate, JobDetails } from "./types";
import { useStatusStore } from "@store/statusStore";

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

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      return await api.del({
        path: `${PackagesApiPath.ASSETS}/${assetId}`,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [PackagesQuery.OWNED] });
    },
  });
};

export const useGetJobDefinition = (assetId: string, version: string[]) => {
  return useQuery<JobDefinition[]>({
    queryKey: [PackagesQuery.JOBS, `${assetId}-${version}`],
    queryFn: async () =>
      await api.get({
        path: `${PackagesApiPath.JOBS}${PackagesApiPath.DEFINITIONS}${PackagesApiPath.BY_ASSET}/${assetId}${PackagesApiPath.VERSIONS}/${version[0]}/${version[1]}/${version[2]}`,
      }),
    enabled: !!(assetId && version),
  });
};


export const useCreateJobDefinitionFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (createRequest: {
      job_def_id: string;
      job_def_template: JobDefinitionTemplate;
    }) => {
      return await api.post({
        path: `${PackagesApiPath.JOBS}${PackagesApiPath.DEFINITIONS}/${createRequest.job_def_id}`,
        body: createRequest.job_def_template,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [PackagesQuery.JOB_DEFS] });
    },
  });
};

export const useGetJobsDetailsByAsset = (
  assetId: string,
  version: string[],
) => {
  return useQuery<JobDetails[]>({
    queryKey: [PackagesQuery.JOBS_DETAILS, `${assetId}-${version}`],
    queryFn: async () =>
      await api.get({
        path: `${PackagesApiPath.JOBS}${PackagesApiPath.BY_ASSET}/${assetId}${PackagesApiPath.VERSIONS}/${version[0]}/${version[1]}/${version[2]}`,
      }),
    enabled: !!(assetId && version),
    refetchInterval: 10000,
  });
};

export const useGetJobDefinitionById = (jobDefId: string) => {
  return useQuery<JobDefinition>({
    queryKey: [PackagesQuery.JOB_DEFS, jobDefId],
    queryFn: async () =>
      await api.get({
        path: `${PackagesApiPath.JOBS}${PackagesApiPath.DEFINITIONS}/${jobDefId}`,
      }),
    enabled: !!jobDefId,
  });
};

export const useRunJob = (assetId: string, version: string) => {
  const queryClient = useQueryClient();
  const { setSuccess, addError } = useStatusStore();

  return useMutation({
    mutationFn: async (form: {
      job_def_id: string;
      params: {
        [key: string]: any;
      };
    }) => {
      return await api.post({
        path: `${PackagesApiPath.JOBS}`,
        body: form,
      });
    },
    onSuccess: () => {
      setSuccess("Automation created");
      queryClient.invalidateQueries({
        queryKey: [PackagesQuery.JOBS_DETAILS, `${assetId}-${version}`],
      });
    },
    onError: (err: any) => {
      addError(err?.detail);
    },
  });
};
