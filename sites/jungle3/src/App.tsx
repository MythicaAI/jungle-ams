import './App.css'
import {
    CssBaseline,
    CssVarsProvider,
    Tab,
    Tabs,
    TabPanel,
    TabList,
    Sheet
} from "@mui/joy";

import {Outlet, Link, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import {CookiesProvider} from "react-cookie";
import {AuthHeader} from "./AuthHeader.tsx";

function App() {
    // @ts-expect-error: ts-unused
    const tabsChanged = (e, value): void => {
        setActiveTab(value);
    }

    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        switch (location.pathname) {
            case '/':
            default:
                setActiveTab(0);
                break;
            case '/profile':
                setActiveTab(1);
                break;
            case '/uploads':
                setActiveTab(2);
                break;
            case '/orgs':
                setActiveTab(3);
                break;
        }
    }, [location.pathname]);

    return <CssVarsProvider><CookiesProvider>
        {/* must be used under CssVarsProvider */}
        <CssBaseline/>
        <Sheet sx={{ width: '100%', height: '100%' }}>
            <AuthHeader/>
            <Tabs orientation='vertical' variant='outlined' onChange={tabsChanged} value={activeTab}>
                <TabList>
                    <Tab variant="plain" color="neutral" component={Link} to={"/"}>
                        Assets
                    </Tab>
                    <Tab variant="plain" color="neutral" component={Link} to={"/profile"}>
                        Profile
                    </Tab>
                    <Tab variant="plain" color="neutral" component={Link} to={"/uploads"}>
                        Uploads
                    </Tab>
                    <Tab variant="plain" color="neutral" component={Link} to={"/orgs"}>
                        Orgs
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
                <TabPanel value={3}>
                    {activeTab === 3 && <Outlet />}
                </TabPanel>
            </Tabs>
        </Sheet>
    </CookiesProvider></CssVarsProvider>
}

export default App
