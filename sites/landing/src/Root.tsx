import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { CookiesProvider } from "react-cookie";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./utils/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

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
