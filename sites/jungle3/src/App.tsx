import React from "react";
import { Routes, Route } from "react-router-dom";
import ErrorPage from "@pages/ErrorPage";
import ProfileSettings from "@pages/ProfileSettings";
import Assets from "@pages/Assets";
import { AssetEditWrapper } from "@pages/AssetEdit";
import Login from "@pages/Login";
import OrgsList from "@pages/OrgsList";
import { FileViewWrapper } from "@pages/FileView";
import { Packages } from "@pages/Packages";
import Uploads from "@pages/Uploads";
import { Layout } from "./components/common/Layout";
import { Notification } from "./components/Notification";
import { PackageViewWrapper } from "@pages/PackageView";
import { ApiKeys } from "@pages/ApiKeys";
import "./styles/App.css";

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
