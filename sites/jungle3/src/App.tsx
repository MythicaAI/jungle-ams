import React from "react";
import { Routes, Route } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.tsx";
import ProfileSettings from "./pages/ProfileSettings.tsx";
import Assets from "./pages/Assets.tsx";
import { AssetEditWrapper } from "./pages/AssetEdit.tsx";
import Login from "./pages/Login.tsx";
import OrgsList from "./pages/OrgsList.tsx";
import { FileViewWrapper } from "./pages/FileView.tsx";
import { Packages } from "./pages/Packages.tsx";
import Uploads from "./pages/Uploads.tsx";
import { Layout } from "./components/common/Layout.tsx";
import { Notification } from "./components/Notification.tsx";
import "./styles/App.css";
import { PackageViewWrapper } from "./pages/PackageView.tsx";
import { ApiKeys } from "./pages/ApiKeys.tsx";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="*" element={<Layout />} errorElement={<ErrorPage />}>
          <Route index element={<Assets />} />
          <Route path="profile" element={<ProfileSettings create={false} />} />
          <Route path="packages" element={<Packages />} />
          <Route path="uploads" element={<Uploads />} />
          <Route path="api-keys" element={<ApiKeys />} />
          <Route
            path="assets/:asset_id/versions/:version"
            element={<AssetEditWrapper />}
          />
          <Route path="orgs" element={<OrgsList />} />
          <Route path="login" element={<Login />} />
          <Route path="files/:file_id" element={<FileViewWrapper />} />
          <Route
            path="package-view/:asset_id/versions/:version_id"
            element={<PackageViewWrapper />}
          />
        </Route>
      </Routes>
      <Notification />
    </>
  );
};

export default App;
