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
                    </Tabs>
                </Box>
                <Box>
                    test content
                </Box>
            </Box>

        </CssVarsProvider>
    )
}

export default App
