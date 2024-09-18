import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useGlobalStore } from "./stores/globalStore.ts";
import { translateError } from "./services/backendCommon.ts";
import { Box } from "@mui/joy";
import { useStatusStore } from "./stores/statusStore.ts";
import { useAuthenticationActions } from "./services/hooks/hooks.tsx";
import { useAuth0 } from "@auth0/auth0-react";

const Login: React.FC = () => {
  const [cookies, setCookie] = useCookies([
    "profile_id",
    "auth_token",
    "refresh_token",
  ]);
  const { logout: authenticationLogout } = useAuthenticationActions();
  const { logout: auth0Logout } = useAuth0();
  const { clearAll } = useGlobalStore();
  const { addError } = useStatusStore();

  const clearCookies = () => {
    setCookie("auth_token", "", { path: "/" });
    setCookie("refresh_token", "", { path: "/" });
    setCookie("profile_id", "", { path: "/" });
  };

  const handleLogout = () => {
    const currentLocation = window.location.origin;

    if (!cookies?.profile_id) {
      return;
    }
    authenticationLogout()
      .then(() => {
        auth0Logout({ logoutParams: { returnTo: currentLocation } });
      })
      .catch((err) => {
        addError(translateError(err));
      })
      .finally(() => {
        clearAll();
        clearCookies();
      });
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return <Box>Thank you for visiting! ...Ending your session</Box>;
};

export default Login;
