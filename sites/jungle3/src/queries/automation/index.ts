import { useQuery } from "@tanstack/react-query";
import { api } from "@services/api";
import { AutomationRunRequest, AutomationResponse } from "types/apiTypes";
import { AutomationApiPath, AutomationQuery } from "./enums";

export const useRunAutomation = (request: AutomationRunRequest, shouldRun: boolean) => {
  return useQuery<AutomationResponse>({
    queryKey: [AutomationQuery.AUTOMATION],
    queryFn: async () =>
      await api.post({
        path: `${AutomationApiPath.AUTOMATION}${AutomationApiPath.RUN}`,
        body: request,
      }),
    enabled: shouldRun,
  });
};
