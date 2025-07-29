import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { CookiesProvider } from "react-cookie";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Auth0ProviderWithHistory from "./providers/Auth0ProviderWithHistory.tsx";
import App from "./App";

const Root = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <CssVarsProvider defaultMode="system" modeStorageKey="my-app-mode">
        <CookiesProvider>
          <Auth0ProviderWithHistory>
            <CssBaseline />
            <App />
          </Auth0ProviderWithHistory>
        </CookiesProvider>
      </CssVarsProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default Root;
