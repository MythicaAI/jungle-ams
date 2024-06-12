import {Avatar, Grid, Typography} from "@mui/joy";
import {Link, useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";
import {useEffect, useState} from "react";
import {useGlobalStore} from "./stores/globalStore.ts";
import axios from "axios";
import {defaultProfileResponse, ProfileResponse, ResolvedOrgRef, SessionStartResponse} from './types/apiTypes.ts'
import {getData} from "./services/backendCommon.ts";
import {Profile} from "./schema_types/profiles.ts";

// proxy the auth token from cookies to the auth store
// TODO: there are security problems with this approach, the cookies should be HttpsOnly
// we need to think about how to do the persistence without exposing the token to XSS

export const AuthHeader = () => {
    const [needsLogin, setNeedsLogin] = useState(true);
    const [needsSession, setNeedsSession] = useState(true);
    const [cookies, ] = useCookies(['profile_id', 'auth_token', 'refresh_token'])
    const {authToken, profile, setAuthToken, setProfile, setOrgRoles} = useGlobalStore();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("useEffect - validate login session");
        if (!cookies.profile_id) {
            setNeedsLogin(true);
            setNeedsSession(true);
            navigate("/login");
            return // early return, nothing else we can do without a profile_id
        } else {
            setNeedsLogin(false);
        }

        if (!authToken) {
            setNeedsSession(true);
        } else {
            setNeedsSession(false);
        }
    }, [authToken, cookies]);

    useEffect(() => {
        if (needsSession) {
            updateSession(cookies.profile_id);
        }
    }, [cookies, needsSession]);

    useEffect(() => {
        if (!needsSession && !needsLogin) {
            updateProfileData(cookies.profile_id, authToken);
        }
    }, [needsSession, needsLogin, authToken, cookies]);

    function mergeWithDefaults<T extends Partial<ProfileResponse>>(defaultObj: ProfileResponse, inputObj: T): ProfileResponse {
      return Object.fromEntries(
        Object.entries(defaultObj).map(([key, value]) => [
          key,
          inputObj[key as keyof T] !== null ? inputObj[key as keyof T] : value,
        ])
      ) as ProfileResponse;
    }

    const updateSession = (profile_id: string) => {
        console.log("updateSession", profile_id);
        // Get a new auth_token with the profile_id
        getData<SessionStartResponse>(`profiles/start_session/${profile_id}`).then(data => {
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            setAuthToken(data.token);
            const input: Partial<ProfileResponse> = data.profile;
            const merged = mergeWithDefaults(defaultProfileResponse(), input)
            setProfile(merged as Profile);
            setNeedsSession(false);
        }).catch(err => {
            console.log(`start_session failed ${err}`);
            setAuthToken('');
            setNeedsSession(true);
        });
    }

    const updateProfileData = (profile_id: string, auth_token: string) => {
        const authHeader = `Bearer ${auth_token}`;
        console.log("updateProfileData", profile_id, authHeader);
        axios.defaults.headers.common['Authorization'] = authHeader;
        getData<ProfileResponse>(`profiles/${cookies.profile_id}`).then(data=>{
            const input = data as Partial<ProfileResponse>;
            const merged = mergeWithDefaults(defaultProfileResponse(), input)
            setProfile(merged as Profile);
        })
        getData<ResolvedOrgRef[]>("orgs/").then(data => {
            setOrgRoles(data)
        });
    }

    return (
        <Grid container spacing={2} sx={{flexGrow: 1}}>
            <Grid xs={10}>
                <Typography level="h2" component="h1" alignContent="left">
                    HDA Manager
                </Typography>
            </Grid>
            {authToken ?
                <Grid xs={2}>
                    <Avatar variant="outlined" alt={profile.name}/>
                </Grid>
                :
                <Grid xs={2}>
                    <Avatar alt="" variant="soft"/>
                    <Link to={"/login"}>Not authenticated</Link>
                </Grid>
            }
            <Grid xs={10}>
                <Link to={"/login"}>
                    <Typography level="body-xs">
                        {profile.name ? profile.name : "No Profile"}: {cookies.profile_id}
                    </Typography>
                </Link>
            </Grid>
            <Grid xs={2}>
                <Typography level="body-xs" alignContent="center">
                    {authToken ? "logged in" : "logged out"}
                </Typography>
            </Grid>
        </Grid>);
}
