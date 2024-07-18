import qs from "qs";
import Cookies from "universal-cookie";
import { HttpMethod } from "../api/enums";

import {
  AuthRequest,
  AuthRequestOptions,
  AuthApiError,
  AuthOptions,
} from "./types";

const cookies = new Cookies();

export const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

const formatAuthApiOptions = (
  options: AuthOptions,
  method: string,
): AuthRequestOptions => {
  const { path, query, body, withFormData = false, contentType } = options;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const formattedBody = !withFormData && body ? JSON.stringify(body) : body;

  return {
    path: `${apiBaseUrl}${path}${
      query ? `?${qs.stringify(query, { encode: false })}` : ""
    }`,
    options: {
      method,
      headers: {
        ...(contentType
          ? { "Content-Type": contentType }
          : !withFormData && body
            ? { "Content-Type": "application/json" }
            : {}),
      },
      ...(body && {
        body: formattedBody,
      }),
    },
  };
};

export const authRequest: AuthRequest = ({ path, options }) =>
  new Promise(async (resolve, reject) => {
    fetch(path, options)
      .then(async (response) => {
        if (response.ok) {
          return response.status !== 204 ? response.json() : response.text();
        }

        return Promise.reject(response.json());
      })
      .then((json) => {
        resolve(json);
      })
      .catch((json) => {
        try {
          json
            .then((err: AuthApiError) => {
              reject(err);
            })
            .catch((err: AuthApiError) => {
              reject(err);
            });
        } catch (err) {
          reject(json);
        }
      });
  });

export const Auth = {
  get: (options: AuthOptions) =>
    authRequest(formatAuthApiOptions(options, HttpMethod.GET)),
  del: (options: AuthOptions) =>
    authRequest(formatAuthApiOptions(options, HttpMethod.DELETE)),
  post: (options: AuthOptions) =>
    authRequest(formatAuthApiOptions(options, HttpMethod.POST)),
  put: (options: AuthOptions) =>
    authRequest(formatAuthApiOptions(options, HttpMethod.PUT)),
  patch: (options: AuthOptions) =>
    authRequest(formatAuthApiOptions(options, HttpMethod.PATCH)),
};

export const getAuthenticationToken = () =>
  new Promise<string>(async (resolve, reject) => {
    const profileId = cookies.get("profile_id");
    const authTokenFromCookies = cookies.get("auth_token");

    let token: string | null = authTokenFromCookies;
    if (!token && profileId) {
      Auth.get({
        path: `/profiles/start_session/${profileId}`,
      })
        .then((res) => {
          cookies.set("auth_token", res.token, { path: "/" });
          token = res.token;
        })
        .catch(() => {
          cookies.set("auth_token", "", { path: "/" });
          cookies.set("profile_id", "", { path: "/" });
        });
    }

    return token ? resolve(token) : reject();
  });
