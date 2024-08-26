import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { CookiesProvider } from "react-cookie";
import App from "./App";
import Auth0ProviderWithHistory from "./providers/Auth0ProviderWithHistory.tsx";
import {HelmetProvider} from "react-helmet-async";

const Root = () => (
  <CssVarsProvider modeStorageKey="my-app-mode">
    <CookiesProvider>
      <Auth0ProviderWithHistory>
        <HelmetProvider>
          <CssBaseline/>
          <App/>
        </HelmetProvider>
      </Auth0ProviderWithHistory>
    </CookiesProvider>
  </CssVarsProvider>
);

export default Root;
