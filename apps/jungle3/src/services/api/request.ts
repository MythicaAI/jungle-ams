import { ApiError, Request } from "./types";
import { triggerErrorMessage } from "./triggerErrorMessage";
import { handleStatusCodes } from "./handleStatusCodes";

export const request: Request = ({
  path,
  options,
  file,
  json,
  errorConfig = {},
}) =>
  new Promise(async (resolve, reject) => {
    fetch(path, options)
      .then(async (response) => {
        if (handleStatusCodes(response.status)) return;

        if (response.ok) {
          // @ts-ignore
          if (response.status === 204) return resolve();
          if (file) return response.blob();
          if (json) return response.json();
          return response.text();
        }
        return Promise.reject(response.json());
      })
      .then((json) => {
        resolve(json);
      })
      .catch((json) => {
        try {
          json
            .then((err: ApiError) => {
              triggerErrorMessage(errorConfig, err);
              reject(err);
            })
            .catch((err: any) => {
              reject(err);
            });
        } catch (err) {
          triggerErrorMessage(errorConfig, json);
          reject(json);
        }
      });
  });
