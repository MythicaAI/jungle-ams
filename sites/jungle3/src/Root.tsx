import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { CookiesProvider } from "react-cookie";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";

const Root = () => (
  <HelmetProvider>
    <CssVarsProvider defaultMode="system" modeStorageKey="my-app-mode">
      <CookiesProvider>
        <CssBaseline />
        <App />
      </CookiesProvider>
    </CssVarsProvider>
  </HelmetProvider>
);

export default Root;
