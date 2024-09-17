import { flowRight } from "lodash";
import { generateOptions } from "./generateOptions";
import { request } from "./request";
import {
  RequestOptions,
  SetupRequest,
  RunMiddleware,
  Middleware,
  Options,
  RequestApi,
} from "./types";
import { ErrorMessage, HttpMethod } from "./enums";

const runMiddleware: RunMiddleware = async (options, middlewares) => {
  // Make mutable copy of options
  let newOptions = { ...options };

  /**
   * Update request options
   * This is executed by the last middleware
   */
  const updateOptions = (requestOptions: RequestOptions) => {
    newOptions = requestOptions;
  };

  /**
   * Chain all middleware together
   * Pass updateOptions to last middleware in chain
   */
  const chain = flowRight(...middlewares)(updateOptions);

  // Start running the middleware chain
  await chain(newOptions);

  return newOptions;
};

const setupRequest: SetupRequest = async (middlewares, options) =>
  request(await runMiddleware(generateOptions(options), middlewares));

class ApiHelper {
  middlewares: Middleware[] = [];

  api: RequestApi = {
    get: (args) => this.generateRequest({ method: HttpMethod.GET, ...args }),
    del: (args) => this.generateRequest({ method: HttpMethod.DELETE, ...args }),
    post: (args) => this.generateRequest({ method: HttpMethod.POST, ...args }),
    put: (args) => this.generateRequest({ method: HttpMethod.PUT, ...args }),
    patch: (args) =>
      this.generateRequest({ method: HttpMethod.PATCH, ...args }),
  };

  applyMiddleware = (
    middlewareList?: Middleware[] | { [key: string]: Middleware },
  ) => {
    if (Array.isArray(middlewareList)) {
      this.middlewares = middlewareList;
    } else if (typeof middlewareList === "object") {
      this.middlewares = Object.values(middlewareList);
    } else {
      console.error(ErrorMessage.MIDDLEWARE_TYPE);
    }
  };

  generateRequest = (options: Options) =>
    setupRequest(this.middlewares, options);
}

export default ApiHelper;
