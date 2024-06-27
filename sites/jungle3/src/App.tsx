import './App.css'
import {
    CssBaseline,
    CssVarsProvider,
    Sheet
} from "@mui/joy";

import {Outlet} from "react-router-dom";
import {CookiesProvider} from "react-cookie";
import {AuthHeader} from "./AuthHeader.tsx";


function App() {
    return <CssVarsProvider defaultMode="system" modeStorageKey="my-app-mode">
        <CookiesProvider>
            {/* must be used under CssVarsProvider */}
            <CssBaseline/>
            <Sheet sx={{width: '100%', height: '100%'}}>
                <AuthHeader/>
                <Outlet/>
            </Sheet>
        </CookiesProvider>
    </CssVarsProvider>
}

export default App
