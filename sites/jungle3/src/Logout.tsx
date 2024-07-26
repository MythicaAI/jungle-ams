import React, {useCallback, useEffect, useState} from "react";
import {useCookies} from "react-cookie";
import {useGlobalStore} from "./stores/globalStore.ts";
import {translateError} from "./services/backendCommon.ts";
import {Link, useNavigate} from "react-router-dom";
import {Box, Button, Card, Grid, Input, Stack} from "@mui/joy";
import {useStatusStore} from "./stores/statusStore.ts";
import {useAuthenticationActions} from "./services/hooks/hooks.tsx";
import {useAuth0} from "@auth0/auth0-react";

const Login: React.FC = () => {
  const [cookies, setCookie] = useCookies([
    "profile_id",
    "auth_token",
    "refresh_token",
  ]);
  const {logout: authenticationLogout} = useAuthenticationActions();
  const {logout: auth0Logout} = useAuth0();
  const {clearAll} = useGlobalStore();
  const {addError} = useStatusStore();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(10);

  const handleLogout = () => {
    if (!cookies.profile_id) {
      return;
    }
    authenticationLogout(cookies.profile_id)
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        addError(translateError(err));
      }).finally(() => {
        clearAll();
        setCookie("profile_id", "", {path: "/"});
        setCookie("auth_token", "", {path: "/"});
        setCookie("refresh_token", "", {path: "/"});

        auth0Logout({ logoutParams: { returnTo: window.location.origin } });
      });
  };

  const updateTimer = useCallback(() => {
    setTimeLeft(prevTime => {
      const updatedTimeLeft = prevTime - 0.25;
      if (updatedTimeLeft <= 0) {
        handleLogout();
        return 0;
      }
      return updatedTimeLeft;
    });
  }, [handleLogout]); // Add any other dependencies here

  useEffect(() => {
    const timerId = setInterval(updateTimer, 250); // 250ms = 0.25 seconds

    return () => clearInterval(timerId); // Cleanup on unmount
  }, [updateTimer]);

  return (
    <Box>
      Thank you for visiting! ...Ending your session
      <Card>{timeLeft}</Card>
    </Box>
  );
};

export default Login;
