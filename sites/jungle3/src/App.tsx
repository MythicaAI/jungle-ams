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
            case '/packages':
                setActiveTab(1);
                break;
            case '/profile':
                setActiveTab(2);
                break;
            case '/uploads':
                setActiveTab(3);
                break;
            case '/orgs':
                setActiveTab(4);
                break;
        }
    }, [location.pathname]);

    return <CssVarsProvider><CookiesProvider>
        {/* must be used under CssVarsProvider */}
        <CssBaseline/>
        <Sheet sx={{ width: '100%', height: '100%' }}>
            <AuthHeader/>
            <Outlet />
        </Sheet>
    </CookiesProvider></CssVarsProvider>
}

export default App
