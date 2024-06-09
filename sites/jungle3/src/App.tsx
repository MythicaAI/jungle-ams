import './App.css'
import {
    CssBaseline,
    CssVarsProvider,
    Tab,
    Tabs,
    TabPanel,
    Typography, TabList,
    Sheet, Box
} from "@mui/joy";

import {Outlet, Link, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import {CookiesProvider, useCookies} from "react-cookie";
import {AuthHeader} from "./AuthHeader.tsx";

function App() {
    const tabsChanged = (e, value: number): void => {
        setActiveTab(value);
    }
    const [cookies, ] = useCookies(['profile_id', 'auth_token', 'refresh_token'])
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);

    const isAuthenticated = () => {
        if (cookies.auth_token === undefined) {
            return false;
        }
        console.log("auth_token", cookies.auth_token);
        return cookies.auth_token !== '';
    }

    useEffect(() => {
        switch (location.pathname) {
            case '/uploads':
                setActiveTab(1);
                break;
            case '/profile':
                setActiveTab(2);
                break;
            case '/':
            default:
                setActiveTab(0);
                break;
        }
    }, [location.pathname]);

    return <CssVarsProvider><CookiesProvider>
        {/* must be used under CssVarsProvider */}
        <CssBaseline/>
        <Sheet sx={{ width: '100%', height: '100%' }}>
            <Typography level="h1" component="h1">
                HDA Manager
            </Typography>

            <AuthHeader authenticated={isAuthenticated()}/>
            <Tabs orientation='vertical' variant='outlined' onChange={tabsChanged}>
                <TabList>
                    <Tab variant="plain" color="neutral" component={Link} to={"/"}>
                        Assets
                    </Tab>
                    <Tab variant="plain" color="neutral" component={Link} to={"/uploads"}>
                        Uploads
                    </Tab>
                    <Tab variant="plain" color="neutral" component={Link} to={"/profile"}>
                        Profile
                    </Tab>
                </TabList>
                <TabPanel value={0}>
                    {activeTab === 0 && <Outlet />}
                </TabPanel>
                <TabPanel value={1}>
                    {activeTab === 1 && <Outlet />}
                </TabPanel>
                <TabPanel value={2}>
                    {activeTab === 2 && <Outlet />}
                </TabPanel>
            </Tabs>
        </Sheet>
    </CookiesProvider></CssVarsProvider>
}

export default App
