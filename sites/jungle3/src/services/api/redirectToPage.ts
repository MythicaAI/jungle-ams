import config from "./config";

const redirect = (path: string): void => {
  window.location.href = path;
};

export const redirectToLogin = () => redirect(config.loginPath);
