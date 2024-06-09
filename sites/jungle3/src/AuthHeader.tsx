import {Box, Typography} from "@mui/joy";
import {Link} from "react-router-dom";
import {useCookies} from "react-cookie";
import {useEffect} from "react";
import {useGlobalStore} from "./stores/globalStore.ts";

interface AuthHeaderProps {
    authenticated: boolean
}
export const AuthHeader: React.FC<AuthHeaderProps> = ({authenticated}) => {
    const [cookies] = useCookies(['profile_id', 'auth_token']);
    const {authToken, setAuthToken} = useGlobalStore();
    useEffect(() => {
        if (!authToken && cookies.auth_token) {
            setAuthToken(cookies.auth_token);
            console.log("globalStore authToken updated");
        }
    }, [cookies]);
    return <Box>
                {authenticated ?
                    <Typography level="body-md">
                        Logged in as <Link to={"/login"}>{cookies.profile_id ? cookies.profile_id : "None"}</Link>
                    </Typography>
                    :
                    <Link to={"/login"}>Not authenticated</Link>
                }
            </Box>;
}
