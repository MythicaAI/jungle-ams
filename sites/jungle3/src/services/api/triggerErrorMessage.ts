import { translateError } from "../backendCommon";
import config from "./config";
import { TriggerErrorMessage } from "./types";

export const triggerErrorMessage: TriggerErrorMessage = (
  errorConfig,
  apiError,
) => {
  if (
    errorConfig.hide === true &&
    typeof config.errorMessageFunction !== "function"
  )
    return;

  const translatedMessage = translateError(apiError);

  config.errorMessageFunction(translatedMessage);
};
