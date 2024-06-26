import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorPage from './ErrorPage.tsx'

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import './index.css'
import ProfileSettings from "./ProfileSettings.tsx";
import Uploads from "./Uploads.tsx";
import Assets from "./Assets.tsx";
import {AssetEditWrapper} from "./AssetEdit.tsx";
import Login from "./Login.tsx";
import OrgsList from "./OrgsList.tsx";
import {FileViewWrapper} from "./FileView.tsx";
import {Packages} from "./Packages.tsx";



const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                index: true,
                element: <Assets/>,
            },
            {
                path: "profile",
                element: <ProfileSettings create={false}/>,
            },
            {
                path: "packages",
                element: <Packages/>,
            },
            {
                path: "uploads",
                element: <Uploads/>,
            },
            {
                path: "assets/:asset_id/versions/:version",
                element: <AssetEditWrapper />,
            },
            {
                path: "orgs",
                element: <OrgsList/>,
            },
            {
                path: "login",
                element: <Login/>
            },
            {
                path: "files/:file_id",
                element: <FileViewWrapper />
            }]
    }]
);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router}/>
)