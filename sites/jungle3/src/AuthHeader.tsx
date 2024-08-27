import {
  Avatar,
  Box,
  List,
  ListItemContent,
  ListItemDecorator,
  Stack, styled,
  Typography,
} from "@mui/joy";
import { Link, } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useEffect } from "react";
import { useGlobalStore } from "./stores/globalStore.ts";
import {
  defaultProfileResponse,
  ProfileResponse,
  ResolvedOrgRef, SessionStartAuth0Request,
  SessionStartResponse,
} from "./types/apiTypes.ts";
import { ProfileMenu } from "./components/ProfileMenu.tsx";
import { StatusAlarm } from "./components/StatusAlarm.tsx";
import { api } from "./services/api";
import { useAuth0 } from "@auth0/auth0-react";
import {useStatusStore} from "./stores/statusStore.ts";

// proxy the auth token from cookies to the auth store
// TODO: there are security problems with this approach, the cookies should be HttpsOnly
// we need to think about how to do the persistence without exposing the token to XSS

export const AuthHeader = () => {
  const [cookies, setCookie] = useCookies([
    "profile_id",
    "auth_token",
    "refresh_token",
  ]);
  const { setAuthToken, setProfile, setOrgRoles } =
    useGlobalStore();
  const { addError } = useStatusStore();
  const {
    loginWithRedirect,
    getAccessTokenSilently,
    user,
    isAuthenticated,
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
        .catch((error) => addError("getAccessTokenSilently:" + error));
    }
  }, [cookies]);

  useEffect(() => {
    const getUserMetadata = async (user_id: string) => {
      try {
        // get the access token, this uses cached authentication parameters under the hood
        const accessToken = await getAccessTokenSilently();
        const sessionStartReq: SessionStartAuth0Request = {
          access_token: accessToken,
          user_id: user_id,
        };
        api
          .post<SessionStartResponse>({
            path: `/sessions/auth0-spa`,
            body: sessionStartReq,
          })
          .then((data) => {
            setAuthToken(data.token);
            const input: Partial<ProfileResponse> = data.profile;
            const merged = mergeWithDefaults(defaultProfileResponse(), input);
            setProfile(merged as unknown as ProfileResponse);
          })
          .catch((err) => {
            addError(`session start failed ${err}`);
            setAuthToken("");
          });

      } catch (e: any) {
        addError("Token exception: " + e.message);
        console.error(e.message);
      }
    };
    if (isAuthenticated && user && user.sub) {
      getUserMetadata(user.sub);
    }
  }, [getAccessTokenSilently, isAuthenticated, user]);

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
                  })
                  .catch((error) => {
                    console.log("LOGIN ERR", error);
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
