import './App.css'
import {
    CssBaseline,
    CssVarsProvider,
    Tab,
    Tabs,
    TabPanel,
    Typography, TabList,
    Box,
    Container
} from "@mui/joy";

import Assets from "./Assets.tsx";
import Uploads from "./Uploads.tsx";
import ProfileSettings from "./ProfileSettings.tsx";

function App() {
    return (
        <CssVarsProvider>
            {/* must be used under CssVarsProvider */}
            <CssBaseline/>
            
            <Box
                sx={{
                width: {
                    mobile: 100,
                    laptop: 300,
                },
                }}>
                <Box>
                    <Typography level="h1" component="h1">
                    HDA Manager
                    </Typography>
                </Box>
                <Box>
                    <Tabs orientation='vertical' variant='outlined'>
                        <TabList>
                            <Tab variant="plain" color="neutral">Assets</Tab>
                            <Tab variant="plain" color="neutral">Uploads </Tab>
                            <Tab variant="plain" color="neutral">Settings</Tab>
                        </TabList>
                        <TabPanel value={0}>
                        <Assets />
                        </TabPanel>
                        <TabPanel value={1}>
                        <Uploads />
                        </TabPanel>
                        <TabPanel value={2}>
                        <ProfileSettings />
                        </TabPanel>
                    </Tabs>
                </Box>
                <Box>
                
                </Box>
            </Box>

        </CssVarsProvider>
    )
}

export default App
