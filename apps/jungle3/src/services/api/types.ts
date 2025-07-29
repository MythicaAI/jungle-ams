import { AxiosError } from "axios";
import { errorMessages } from "./errorMessages";

export type ErrorConfig = {
  hide?: boolean;
  message?: string;
};

type BodyInit_ =
  | Blob
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Uint8ClampedArray
  | Float32Array
  | Float64Array
  | DataView
  | ArrayBuffer
  | FormData
  | string
  | null;
type Body = BodyInit_;
type RequestInitWithObjectBody = Omit<RequestInit, "body"> & {
  body?: Body;
};

type ApiTypes = "default";

export type RequestOptions = {
  path: string;
  options: RequestInitWithObjectBody;
  file: any;
  errorConfig: ErrorConfig;
  json: boolean;
  withAuth: boolean;
  contentType?: string;
  version?: string;
  type: ApiTypes;
};

export type Options = {
  method: string;
  path: string;
  query?: any;
  body?: any;
  withAuth?: boolean;
  contentType?: string;
  version?: string;
  file?: any;
  json?: boolean;
  upload?: boolean;
  error?: any;
  type?: ApiTypes;
  customSubdomain?: string;
};

export type FetchOptions = Omit<Options, "method">;

export type GenerateOptions = (options: Options) => RequestOptions;

export type Request = <T = any>(options: RequestOptions) => Promise<T>;

export type FetchCall = <T = any>(args: FetchOptions) => Promise<T>;

export type ApiErrorProps = {
  message: string;
  key: keyof typeof errorMessages;
};

export type ApiError = AxiosError & {
  detail?:
    | { msg: string; type: string }
    | { msg: string; type: string }[]
    | string;
};

export type TriggerErrorMessage = (
  errorConfig: ErrorConfig,
  apiError: ApiError,
) => void;

export type HandleStatusCodes = (code: number) => boolean;

export type RequestApi = {
  get: FetchCall;
  del: FetchCall;
  post: FetchCall;
  put: FetchCall;
  patch: FetchCall;
};

export type RunMiddleware = (
  options: RequestOptions,
  middlewares: Middleware[],
) => Promise<RequestOptions>;

export type SetupRequest = (
  middlewares: Middleware[],
  options: Options,
) => Promise<any>;

export type Middleware = (
  next: NextMiddleware,
) => (options: RequestOptions, ...args: any) => void;
export type NextMiddleware = (options: RequestOptions, ...args: any) => void;

export type ApiConfigType = {
  apiUrls: {
    [type in ApiTypes]: string;
  };
  defaultApi: ApiTypes;
  loginPath: string;
  defaultWithAuth: boolean;
  errorMessageFunction: (message: string) => void;
};

export type QueryParams = Record<string, string>;

export type QueryType = QueryParams & {
  ordering?: string;
  limit?: number;
  offset?: number;
};
