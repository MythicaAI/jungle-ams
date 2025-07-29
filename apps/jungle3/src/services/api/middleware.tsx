import { getAuthenticationToken } from "../hooks/services";
import { ErrorMessage } from "./enums";
import { Middleware } from "./types";

export const authMiddleware: Middleware = (next) => async (requestOptions) => {
  if (requestOptions.withAuth && requestOptions.type === "default") {
    await getAuthenticationToken()
      .then((token) => {
        requestOptions.options.headers = {
          ...requestOptions.options.headers,
          Authorization: `Bearer ${token}`,
        };
      })
      .catch(() => {
        console.error(ErrorMessage.MIDDLEWARE_TOKEN);
      });
  }

  next(requestOptions);
};
