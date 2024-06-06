import './App.css'
import {
    CssBaseline,
    CssVarsProvider,
    Tab,
    Tabs,
    TabPanel,
    Typography, TabList,
    Sheet
} from "@mui/joy";

import {Outlet, Link, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";

function App() {
    const tabsChanged = (_, value: number): void => {
        console.log("tab value " + value);
        setActiveTab(value)
    }
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);

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

    return (
        <CssVarsProvider>
            {/* must be used under CssVarsProvider */}
            <CssBaseline/>
            <Sheet sx={{ width: '100%', height: '100%' }}>
                <Typography level="h1" component="h1">
                    HDA Manager
                </Typography>
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
        </CssVarsProvider>
    )
}

export default App
