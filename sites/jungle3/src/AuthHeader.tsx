import {Avatar, Box, Grid, Typography} from "@mui/joy";
import {Link} from "react-router-dom";
import {useCookies} from "react-cookie";
import {useEffect} from "react";
import {useGlobalStore} from "./stores/globalStore.ts";
import axios from "axios";
import {ProfileResponse, ResolvedOrgRef, SessionStartResponse} from 'types/apiTypes.ts'
import {getData} from "./services/backendCommon.ts";
import {Type} from "lucide-react";

export const AuthHeader = () => {
    const [cookies, ] = useCookies(['profile_id', 'auth_token', 'refresh_token'])
    const {setAuthToken, isLoggedIn, setProfile, profile, setOrgRoles} = useGlobalStore();

    // proxy the auth token from cookies to the auth store
    // TODO: there are security problems with this approach, the cookies should be HttpsOnly
    // we need to think about how to do the persistence without exposing the token to cross site
    // attacks
    useEffect(() => {
        if (!isLoggedIn) {
            if (cookies.auth_token !== "") {
                setAuthToken(cookies.auth_token);
                console.log("globalStore authToken updated from cookie");
            }
            else if (cookies.profile_id) {
                getData<SessionStartResponse>(`profiles/start_session/${cookies.profile_id}`).
                    then(data=> {
                        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                        setAuthToken(data.token);
                        setProfile(data.profile);
                    }).catch(err => {
                        console.log(`start_session failed ${err}`);
                        setAuthToken('');
                    });

                if (isLoggedIn) {
                    getData<ProfileResponse>(`profiles/${cookies.profile_id}`).then(data=>{
                        setProfile(data);
                    })
                    getData<ResolvedOrgRef[]>("orgs").then(data => {
                        setOrgRoles(data)
                    });
                }
            }
        }

    }, [cookies]);

    return (<Grid container spacing={2} sx={{ flexGrow: 1 }}>
                <Grid xs={10}>
                    <Typography level="h2" component="h1" alignContent="left">
                        HDA Manager
                    </Typography>
                </Grid>
                {isLoggedIn ?
                    <Grid xs={2}>
                        <Avatar variant="outlined">{profile.name}</Avatar>
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
                            {profile.name}: {cookies.profile_id}
                        </Typography>
                    </Link>
                </Grid>
                <Grid xs={2}>
                     <Typography level="body-xs" alignContent="center">
                         {isLoggedIn ? "logged in" : "logged out"}
                     </Typography>
                </Grid>
            </Grid>);
}
