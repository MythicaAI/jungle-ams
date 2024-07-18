import axios, { AxiosError } from "axios";

export const getData = async <T>(subpath: string): Promise<T> => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const endpointPath = `${subpath}`;
  const url = `${apiBaseUrl}/${endpointPath}`;

  try {
    const response = await axios.get<T>(url, { maxRedirects: 0 });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "AXIOS-GET-ERROR",
        "url:",
        url,
        "error:",
        error.message,
        "response:",
        error.response ? error.response.data.detail : "",
      );
    } else {
      console.error("UNKNOWN-GET-ERROR:", error);
    }
    throw error;
  }
};

export const postData = async <T>(
  subpath: string,
  data: object,
  config: object = {},
): Promise<T> => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const endpointPath = `${subpath}`;
  const url = `${apiBaseUrl}/${endpointPath}`;

  try {
    const response = await axios.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "AXIOS-POST-ERROR:",
        "url:",
        url,
        error.message,
        "response:",
        error.response ? error.response.data.detail : "",
      );
    } else {
      console.error("UNKNOWN-POST-ERROR:", error);
    }
    throw error;
  }
};

export const deleteData = async <T>(
  subpath: string,
  config: object = {},
): Promise<T> => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const endpointPath = `${subpath}`;
  const url = `${apiBaseUrl}/${endpointPath}`;

  try {
    const response = await axios.delete<T>(url, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "AXIOS-DELETE-ERROR:",
        "url:",
        url,
        error.message,
        "response:",
        error.response ? error.response.data.detail : "",
      );
    } else {
      console.error("UNKNOWN-DELETE-ERROR:", error);
    }
    throw error;
  }
};

export const translateError = (
  err: AxiosError & {
    detail?:
      | { msg: string; type: string }
      | { msg: string; type: string }[]
      | string;
  },
) => {
  if (err.response) {
    // @ts-expect-error: ts2339
    // Server responded with a status other than 2xx, try to extract a detail message
    const detail = err.response.data?.detail;
    if (detail && typeof detail === "string") {
      return `${err.response.status} ${detail}`;
    }
    return `Error: ${err.response.status}`;
  } else if (Array.isArray(err.detail)) {
    if (err.detail.length > 0) {
      return err.detail[0].msg;
    }
    return "Something went wrong.";
  } else if (err.request || (err.detail && typeof err.detail !== "string")) {
    // Request was made but no response received
    // @ts-ignore
    return `Request failed: ${err.message ?? err.detail?.msg}`;
  } else if (err.detail && typeof err.detail === "string") {
    return err.detail;
  } else {
    // Something else caused the error
    return `${err.message}`;
  }
};

export interface ValidationError {
  loc: string[];
  msg: string;
}
export const extractValidationErrors = (err: AxiosError): string[] => {
  if (err.response && err.response.data && err.response.data) {
    // @ts-expect-error: ts2339
    const details = err.response.data.detail;
    if (details) {
      if (typeof details === "string") {
        // return a single string in the details field
        return [details];
      }
      // return the transformed validation problem details
      return (details as ValidationError[]).map(
        (o) => `${o.loc[0]}.${o.loc[1]}: ${o.msg}`,
      );
    }
  }
  return [];
};
