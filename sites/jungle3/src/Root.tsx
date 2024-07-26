import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { CookiesProvider } from "react-cookie";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import Auth0ProviderWithHistory from "./providers/Auth0ProviderWithHistory.tsx";

const Root = () => (
  <HelmetProvider>
    <CssVarsProvider defaultMode="system" modeStorageKey="my-app-mode">
      <CookiesProvider>
        <Auth0ProviderWithHistory>
        <CssBaseline/>
        <App/>
      </Auth0ProviderWithHistory>
      </CookiesProvider>
    </CssVarsProvider>
  </HelmetProvider>
);

export default Root;
