import { ApiUrl } from "./enums";
import { ApiConfigType } from "./types";

const apiConfig: ApiConfigType = {
  /**
   * API base urls
   * @see generateOptions.js
   */
  apiUrls: {
    default: import.meta.env.VITE_API_BASE_URL,
  },

  /**
   * Used to redirect for unauthorized calls
   * @see redirectToPage.js
   */
  loginPath: ApiUrl.LOGIN,

  /**
   * Default API to choose if no option is given
   * @see generateOptions.js
   */
  defaultApi: ApiUrl.DEFAULT,

  /**
   * If the app isn't depended on authorization put this to false
   * If this is turned off it won't use x-access-token in localStorage
   * @see generateOptions.js
   */
  defaultWithAuth: true,

  /**
   * Trigger general error message for api failures
   * @param {string} - generated error message
   *
   * Enter null to disable general error messages
   * @see errorMessages.js
   */
  errorMessageFunction: (message) => {
    console.info(message);
  },
};

export default apiConfig;
