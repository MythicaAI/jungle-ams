import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { CookiesProvider } from "react-cookie";
import App from "./App";

const Root = () => (
  <CssVarsProvider defaultMode="system" modeStorageKey="my-app-mode">
    <CookiesProvider>
      <CssBaseline />
      <App />
    </CookiesProvider>
  </CssVarsProvider>
);

export default Root;
