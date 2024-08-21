import React from "react";
import { useStatusStore } from "../../stores/statusStore";
import { SessionStartResponse } from "../../types/apiTypes";
import { Auth } from "./services";
import { Snackbar, Alert, Stack } from "@mui/joy";
import {v4} from "uuid";

export const useAuthenticationActions = () => {
  const login = async (username: string) =>
    new Promise<SessionStartResponse>((resolve, reject) => {
      Auth.get({
        path: `/profiles/start_session/${username}`,
      })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  const logout = async (username: string) =>
    new Promise<SessionStartResponse>((resolve, reject) => {
      Auth.get({
        path: `/profiles/stop_session/${username}`,
      })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  return { login, logout };
};

export const useNotification = () => {
  const {
    success,
    warnings,
    errors,
    hasStatus: checkStatus,
    clear,
  } = useStatusStore();
  const [open, setOpen] = React.useState(false);
  const [hasStatus, setHasStatus] = React.useState(checkStatus());
  const [duration] = React.useState<undefined | number>(3000);
  const [left, setLeft] = React.useState<undefined | number>();
  const timer = React.useRef<undefined | number>();
  const countdown = () => {
    timer.current = window.setInterval(() => {
      setLeft((prev) => (prev === undefined ? prev : Math.max(0, prev - 100)));
    }, 100);
  };
  React.useEffect(() => {
    if (open && duration !== undefined && duration > 0) {
      setLeft(duration);
      countdown();
    } else {
      window.clearInterval(timer.current);
    }
  }, [open, duration]);

  React.useEffect(() => {
    setHasStatus(checkStatus());
    setOpen(checkStatus());
  }, [success, warnings, errors]);

  const handlePause = () => {
    window.clearInterval(timer.current);
  };
  const handleResume = () => {
    countdown();
  };

  const getColor = () => {
    if (success) return "success";
    if (errors && errors.length > 0) return "danger";
    if (warnings && warnings.length > 0) return "warning";
    return "neutral";
  };

  return (
    <Snackbar
      sx={{ maxWidth: "550px" }}
      variant="outlined"
      color="neutral"
      autoHideDuration={duration}
      resumeHideDuration={left}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
      onUnmount={() => setLeft(undefined)}
      open={hasStatus && open}
      onClose={() => {
        setOpen(false);
        clear();
      }}
    >
      <Stack gap="15px">
        {success && <Alert key={v4()} color={getColor()}>{success}</Alert>}
        {errors &&
          errors.length > 0 &&
          errors.map((msg) => <Alert key={v4()} color={getColor()}>Error: {msg}</Alert>)}

        {warnings &&
          warnings.length > 0 &&
          warnings.map((msg) => (
            <Alert key={v4()} color={getColor()}>Warning: {msg}</Alert>
          ))}
      </Stack>
    </Snackbar>
  );
};
