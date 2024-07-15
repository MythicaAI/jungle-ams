import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorPage from './ErrorPage.tsx';
import ProfileSettings from './ProfileSettings.tsx';
import Assets from './Assets.tsx';
import { AssetEditWrapper } from './AssetEdit.tsx';
import Login from './Login.tsx';
import OrgsList from './OrgsList.tsx';
import { FileViewWrapper } from './FileView.tsx';
import { Packages } from './Packages.tsx';
import Uploads from './Uploads.tsx';
import './App.css';
import { Layout } from './components/Layout.tsx';

const App: React.FC = () => (
  <Routes>
    <Route path="*" element={<Layout />} errorElement={<ErrorPage />}>
      <Route index element={<Assets />} />
      <Route path="profile" element={<ProfileSettings create={false} />} />
      <Route path="packages" element={<Packages />} />
      <Route path="uploads" element={<Uploads />} />
      <Route
        path="assets/:asset_id/versions/:version"
        element={<AssetEditWrapper />}
      />
      <Route path="orgs" element={<OrgsList />} />
      <Route path="login" element={<Login />} />
      <Route path="files/:file_id" element={<FileViewWrapper />} />
    </Route>
  </Routes>
);

export default App;
