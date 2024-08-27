import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { CookiesProvider } from "react-cookie";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./queryClient";
import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";

const Root = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <CssVarsProvider defaultMode="system" modeStorageKey="my-app-mode">
        <CookiesProvider>
          <CssBaseline />
          <App />
        </CookiesProvider>
      </CssVarsProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default Root;
