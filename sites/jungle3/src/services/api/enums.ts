export enum HttpMethod {
  GET = "GET",
  DELETE = "DELETE",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
}

export enum ErrorMessage {
  DEFAULT = "Something went wrong. Please try again later.",
  MIDDLEWARE_TYPE = "Middleware list applied to the API helper is not of type array or object",
  MIDDLEWARE_TOKEN = "Middleware token not found",
}

export enum ApiUrl {
  LOGIN = "/login",
  DEFAULT = "default",
  BASE = "/",
}
