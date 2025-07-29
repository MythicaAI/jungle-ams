import { RouteProps } from "react-router-dom";

export type AuthOptions = {
  path: string;
  body?:
    | {
        [key: string]: any;
      }
    | any;
  query?: {
    [key: string]: string;
  };
  withFormData?: boolean;
  contentType?: string;
};

export type AuthRequestOptions = {
  path: string;
  options: {
    method: string;
    headers: HeadersInit;
    body?: string;
  };
};

// @TODO Fix typing for authentication api errors
export type AuthApiError = any;

export type AuthRequest = <T = any>(options: AuthRequestOptions) => Promise<T>;

export type AuthenticationRouteProps = RouteProps & {
  component: React.ElementType;
};

export type AuthenticationState = {
  authenticated?: boolean;
  loading: boolean;
  error: boolean;
};

export type AuthenticationContextType = {
  state: AuthenticationState;
  dispatch: (userData: Partial<AuthenticationState>) => AuthenticationState;
};

export type AuthenticationTokenType =
  | {
      token: string;
      expires_at: number;
    }
  | undefined;

export type AuthenticationTokensPayload = {
  refresh: string;
  access?: string;
};
