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
import AssetEdit from "./AssetEdit.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: "profile",
        element: <ProfileSettings/>,
      },
      {
        path: "assets",
        element: <Assets/>,
      },
      {
        path: "uploads",
        element: <Uploads/>,
      },
      {
        path: "assets/:assetId:",
        element: <AssetEdit/>,
      }]
  }]
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
