import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useGlobalStore } from "@store/globalStore";
import { translateError } from "@services/backendCommon";
import { Link, useNavigate } from "react-router-dom";
import { Button, Grid, Input, Stack } from "@mui/joy";
import { useStatusStore } from "@store/statusStore";
import { useAuthenticationActions } from "@services/hooks/hooks";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [, setCookie] = useCookies([
    "profile_id",
    "auth_token",
    "refresh_token",
  ]);
  const { login } = useAuthenticationActions();
  const { setAuthToken } = useGlobalStore();
  const { addError } = useStatusStore();
  const navigate = useNavigate();

  useEffect(() => {
    setUsername("32a05c1d-d2c6-47f2-9411-156c3619c71a");
  }, []);

  const clearCookies = () => {
    setCookie("auth_token", "", { path: "/" });
    setCookie("refresh_token", "", { path: "/" });
    setCookie("profile_id", "", { path: "/" });
  };
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setCookie("profile_id", username, { path: "/" });

    // 32a05c1d-d2c6-47f2-9411-156c3619c71a

    login(username)
      .then((r) => {
        setCookie("auth_token", r.token, { path: "/" });
        setCookie("refresh_token", "", { path: "/" });
        setAuthToken(r.token);
        navigate("/");
      })
      .catch((err) => {
        clearCookies();
        addError(translateError(err));
      });
  };

  return (
    <form onSubmit={handleLogin}>
      <Grid container spacing={2}>
        <Grid xs={3} />
        <Grid xs={6}>
          <Stack spacing={1}>
            <Input
              variant="outlined"
              id="username"
              placeholder="Username"
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              variant="outlined"
              id="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endDecorator={<Button type="submit">Login</Button>}
            />
          </Stack>
        </Grid>
        <Grid xs={3} />

        <Grid xs={12}>
          <Stack>
            <Link to="/forgot-password">Forgot Password?</Link>
            <Link to="/profile?create=1">Create Profile</Link>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

export default Login;
