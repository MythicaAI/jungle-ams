import qs from "qs";

import config from "./config";
import { GenerateOptions } from "./types";

export const generateOptions: GenerateOptions = ({
  method,
  path,
  query,
  body,
  withAuth = config.defaultWithAuth,
  json = true,
  file = false,
  upload = false,
  error,
  type = config.defaultApi,
  contentType,
  version,
}) => {
  if (!upload && body) body = JSON.stringify(body);

  return {
    path: `${import.meta.env.VITE_API_BASE_URL}${path}${
      query ? `?${qs.stringify(query)}` : ""
    }`,
    options: {
      headers: {
        ...(!upload && body && !contentType
          ? { "Content-Type": "application/json" }
          : contentType
            ? { "Content-Type": contentType }
            : {}),
        ...(version ? { "X-Contentful-Version": version } : {}),
      },
      method,
      ...(body ? { body } : {}),
    },
    file,
    json,
    errorConfig: error,
    withAuth,
    type,
  };
};
