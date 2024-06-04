import './App.css'
import {
    CssBaseline,
    CssVarsProvider,
    Tab,
    Tabs,
    TabPanel,
    Typography, TabList,
    Box,
    Sheet
} from "@mui/joy";

import Assets from "./Assets.tsx";
import Uploads from "./Uploads.tsx";
import ProfileSettings from "./ProfileSettings.tsx";
import {Outlet, Link } from "react-router-dom";
import {useRef} from "react";

function App() {
    const tabsChanged = (e: React.SyntheticEvent<Element>, value: string): void => {
        console.log("tab value " + value);
    }

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
                        <Tab variant="plain" color="neutral" component={Link} to={"/assets"}>
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
                    <Outlet/>
                    </TabPanel>
                    <TabPanel value={1}>
                    <Uploads />
                    </TabPanel>
                    <TabPanel value={2}>
                    <ProfileSettings />
                    </TabPanel>
                </Tabs>
            </Sheet>
        </CssVarsProvider>
    )
}

export default App
