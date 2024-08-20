import {
  Avatar,
  Box,
  Button,
  List,
  ListItemContent,
  ListItemDecorator,
  Stack,
  styled,
  Typography,
} from "@mui/joy";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { useGlobalStore } from "./stores/globalStore.ts";
import {
  defaultProfileResponse,
  ProfileResponse,
  ResolvedOrgRef,
  SessionStartResponse,
} from "./types/apiTypes.ts";
import { ProfileMenu } from "./components/ProfileMenu.tsx";
import { StatusAlarm } from "./components/StatusAlarm.tsx";
import { api } from "./services/api";
import { useAuth0 } from "@auth0/auth0-react";

// proxy the auth token from cookies to the auth store
// TODO: there are security problems with this approach, the cookies should be HttpsOnly
// we need to think about how to do the persistence without exposing the token to XSS

export const AuthHeader = () => {
  const [cookies, setCookie] = useCookies([
    "profile_id",
    "auth_token",
    "refresh_token",
  ]);
  const { authToken, profile, setAuthToken, setProfile, setOrgRoles } =
    useGlobalStore();
  const {
    loginWithRedirect,
    getAccessTokenSilently,
    user,
    isAuthenticated,
    isLoading,
  } = useAuth0();

  console.log("user: ", user);
  console.log("isAuthenticated: ", isAuthenticated);

  // Refresh the backend API session based on the Auth0 state (create a new auth token)
  useEffect(() => {
    if (cookies.auth_token && cookies.auth_token.length > 0) {
      updateProfileData();
    } else {
      getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "all",
        },
      })
        .then((token) => {
          console.log("token: ", token);
          setCookie("auth_token", token, { path: "/" });
        })
        .catch((error) => console.error("getAccessTokenSilently failed with:", error));
    }
  }, [cookies]);

  // Refresh the profile based on having an API session token
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      updateSession();
    }
  }, [isLoading, isAuthenticated]);

  function mergeWithDefaults<T extends Partial<ProfileResponse>>(
    defaultObj: ProfileResponse,
    inputObj: T,
  ): ProfileResponse {
    return Object.fromEntries(
      Object.entries(defaultObj).map(([key, value]) => [
        key,
        inputObj[key as keyof T] !== null ? inputObj[key as keyof T] : value,
      ]),
    ) as ProfileResponse;
  }

  const updateSession = () => {
    console.log("updateSession", user ? user.sub : "undefined");

    // Get a new auth_token with the profile_id
    api
      .get<SessionStartResponse>({
        path: `/profiles/start_session/${user?.sub}`,
      })
      .then((data) => {
        setAuthToken(data.token);
        const input: Partial<ProfileResponse> = data.profile;
        const merged = mergeWithDefaults(defaultProfileResponse(), input);
        setProfile(merged as unknown as ProfileResponse);
      })
      .catch((err) => {
        console.log(`start_session failed ${err}`);
        setAuthToken("");
      });
  };

  const updateProfileData = () => {
    api
      .get<ProfileResponse>({ path: `/profiles/${cookies.profile_id}` })
      .then((data) => {
        const input = data as Partial<ProfileResponse>;
        const merged = mergeWithDefaults(defaultProfileResponse(), input);
        setProfile(merged as unknown as ProfileResponse);
        api.get<ResolvedOrgRef[]>({ path: "/orgs/" }).then((data) => {
          setOrgRoles(data);
        });
      });
  };

  const LoginAvatarButton = styled("div")({
    display: "inline-block",
    cursor: "pointer",
    "&:focus": {
      outline: "none",
    },
  });

  return (
    <List orientation={"horizontal"}>
      <ListItemDecorator>
        <Link to={"/"}>
          <Box
            component="img"
            src="/mythica-logo.png"
            alt="Mythica Logo"
            sx={{
              width: "100%",
              height: 48, // Adjust this value to set the desired height
              objectPosition: "center",
              mb: 2, // Adds some margin below the image
            }}
          />
        </Link>
      </ListItemDecorator>
      <ListItemContent>
        <Typography level="h2" sx={{ flexGrow: 1 }}>
          HDA Package Index
        </Typography>
      </ListItemContent>
      <ListItemDecorator>
        <Stack direction="row" spacing={1}>
          <StatusAlarm />
          {isAuthenticated ? (
            <ProfileMenu name={user && user.name ? user.name : ""} />
          ) : (
            <LoginAvatarButton
              role="button"
              tabIndex={0}
              onClick={() =>
                loginWithRedirect()
                  .then((res) => {
                    console.log("LOGIN RES: ", res);
                    console.log("logged in");
                  })
                  .catch((error) => {
                    console.log("error", error);
                  })
              }
            >
              <Avatar alt="?" variant="soft" />
            </LoginAvatarButton>
          )}
        </Stack>
      </ListItemDecorator>
    </List>
  );
};
