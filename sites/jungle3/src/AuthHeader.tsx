import {Avatar, Box, List, ListItemContent, ListItemDecorator, Stack, Typography} from "@mui/joy";
import {Link, useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";
import {useEffect, useState} from "react";
import {useGlobalStore} from "./stores/globalStore.ts";
import axios from "axios";
import {defaultProfileResponse, ProfileResponse, ResolvedOrgRef, SessionStartResponse} from './types/apiTypes.ts'
import {getData} from "./services/backendCommon.ts";
import {Profile} from "./schema_types/profiles.ts";
import {ProfileMenu} from "./components/ProfileMenu.tsx";
import {StatusAlarm} from "./components/StatusAlarm.tsx";

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
        if (cookies.profile_id && needsSession) {
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
            setProfile(merged as unknown as Profile);
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
            setProfile(merged as unknown as Profile);
        })
        getData<ResolvedOrgRef[]>("orgs/").then(data => {
            setOrgRoles(data)
        });
    }

    return (
        <List orientation={"horizontal"}>
            <ListItemDecorator>
                <Link to={"/"}>
                <Box component="img" src="/mythica-logo.png" alt="Mythica Logo" sx={{
                    width: '100%',
                    height: 32, // Adjust this value to set the desired height
                    objectFit: 'cover',
                    objectPosition: 'center',
                    mb: 2, // Adds some margin below the image
                }} />
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
                    {authToken ?
                        <ProfileMenu name={profile.name}/>
                        :
                        <Link to={"/login"}><Avatar alt="?" variant="soft"/></Link>
                    }
                </Stack>
            </ListItemDecorator>
        </List>);
}
