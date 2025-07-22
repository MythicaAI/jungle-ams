import * as React from "react";

export const lazyRetry: LazyRetryType = (componentImport) => {
  return new Promise((resolve, reject) => {
    const hasRefreshed = JSON.parse(
      window?.sessionStorage.getItem("retry-lazy-refreshed") || "false",
    );

    componentImport()
      .then((component) => {
        if (window.sessionStorage) {
          window.sessionStorage.setItem("retry-lazy-refreshed", "false");
        }
        resolve(component);
      })
      .catch((error) => {
        if (!hasRefreshed && window.sessionStorage) {
          window.sessionStorage.setItem("retry-lazy-refreshed", "true");
          return window.location.reload();
        }
        reject(error);
      });
  });
};

type LazyRetryType = (
  componentImport: () => Promise<ImportType>,
) => Promise<ImportType>;

type ImportType = {
  default: React.ComponentType;
};
