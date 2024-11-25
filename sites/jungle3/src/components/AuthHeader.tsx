import { Box, Button, Divider, Stack, Typography } from "@mui/joy";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useEffect } from "react";
import { useGlobalStore } from "@store/globalStore";
import {
  defaultProfileResponse,
  ProfileResponse,
  ResolvedOrgRef,
  SessionStartAuth0Request,
  SessionStartResponse,
} from "types/apiTypes.ts";
import { ProfileMenu } from "@components/ProfileMenu";
import { StatusAlarm } from "@components/Status/StatusAlarm";
import { api } from "@services/api";
import { useAuth0 } from "@auth0/auth0-react";
import { useStatusStore } from "@store/statusStore";
import { LanguageSelect } from "./LanguageSelector";
import { LucideBookText } from "lucide-react";

// proxy the auth token from cookies to the auth store
// TODO: there are security problems with this approach, the cookies should be HttpsOnly
// we need to think about how to do the persistence without exposing the token to XSS

export const AuthHeader = () => {
  const [cookies, setCookie] = useCookies([
    "profile_id",
    "auth_token",
    "refresh_token",
  ]);
  const { setProfile, setOrgRoles } = useGlobalStore();
  const { addError } = useStatusStore();
  const { loginWithRedirect, getAccessTokenSilently, user, isAuthenticated } =
    useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh the backend API session based on the Auth0 state (create a new auth token)
  useEffect(() => {
    if (cookies.auth_token && cookies.auth_token.length > 0) {
      updateProfileData();
    }
  }, [cookies]);

  useEffect(() => {
    if (isAuthenticated && user && user.sub) {
      startAuthenticatedSession(user.sub);
    }
  }, [getAccessTokenSilently, isAuthenticated, user]);

  useEffect(() => {
    if (
      user &&
      localStorage.getItem("shouldStartOnboarding") === "true" &&
      location.pathname !== "/quick-setup"
    ) {
      navigate("/quick-setup");
    }
  }, [user, location]);

  const startAuthenticatedSession = async (user_id: string) => {
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
          const input: Partial<ProfileResponse> = data.profile;
          const merged = mergeWithDefaults(defaultProfileResponse(), input);
          setProfile(merged as unknown as ProfileResponse);
          setCookie("auth_token", data.token, { path: "/" });
          setCookie("refresh_token", "", { path: "/" });
          setCookie("profile_id", data.profile.profile_id, { path: "/" });
        })
        .catch((err) => {
          addError(`session start failed ${err}`);
          setCookie("auth_token", "", { path: "/" });
          setCookie("refresh_token", "", { path: "/" });
          setCookie("profile_id", "", { path: "/" });
        });
    } catch (e: any) {
      addError("Token exception: " + e.message);
      console.error(e.message);
    }
  };

  const doLoginWithRedirect = () => {
    loginWithRedirect()
      .then((res) => {
        console.log("LOGIN RES: ", res);
      })
      .catch((error) => {
        addError("Login error: " + error);
      });
  };

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
        api.get<ResolvedOrgRef[]>({ path: `/orgs` }).then((data) => {
          setOrgRoles(data);
        });
      });
  };

  return (
    <Stack>
      <Stack direction="row" width="100%" justifyContent="space-between">
        <Link to={"/"}>
          <Stack direction="row" gap="10px">
            <Box
              component="img"
              src="/mythica-logo.png"
              alt="Mythica Logo"
              sx={{
                width: 44,
                minWidth: 44,
                maxWidth: 44,
                height: 48,
                objectPosition: "center",
                mb: 2,
              }}
              id="appLogo"
            />
            <Box
              component="img"
              src="/mythica-text-logo.png"
              alt="Mythica Logo"
              sx={{
                minWidth: 230,
                maxWidth: 230,
                height: 48,
                objectPosition: "center",
                mb: 2,
                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
              id="appLogo"
            />
          </Stack>
        </Link>

        <Stack direction="row" spacing={1}>
          <Box
            width="100%"
            component="a"
            href={`${window.location.origin}/docs`}
            target="_blank"
            sx={{
              display: "flex",
              alignItems: "center",
              height: "42px",
              minWidth: "75px",
            }}
          >
            <Button
              variant="plain"
              color="neutral"
              sx={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                padding: "0",
                gap: "5px",
              }}
            >
              <Typography>API</Typography>
              <LucideBookText />
            </Button>
          </Box>

          <LanguageSelect />
          {isAuthenticated && <StatusAlarm />}
          {isAuthenticated ? (
            <ProfileMenu name={user && user.name ? user.name : ""} />
          ) : (
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => doLoginWithRedirect()}
              sx={{ height: "42px", minWidth: "80px" }}
            >
              Sign in
            </Button>
          )}
        </Stack>
      </Stack>
      <Divider orientation="horizontal" sx={{ mb: "10px" }} />
    </Stack>
  );
};
