import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@components/common/Layout";
import { Notification } from "@components/Notification";
import { CircularProgress, Stack } from "@mui/joy";
import { lazyRetry } from "@services/lazyImport.ts";
import { CookieConsentBanner } from "@components/CookieConsentBanner";
import { useOnboarding } from "@hooks/useOnboarding";
import { ProductTour } from "@components/ProductTour";
import { PrivateRoute } from "@components/PrivateRoute";
import { PackageJobs } from "@pages/PackageJobs";
import { PackageScene } from "@pages/PackageScene";
import "./styles/App.css";

const Dashboard = lazy(() => lazyRetry(() => import("@pages/Dashboard")));
const Assets = lazy(() => lazyRetry(() => import("@pages/Assets")));
const ProfileSettings = lazy(() =>
  lazyRetry(() => import("@pages/ProfileSettings")),
);
const Packages = lazy(() => lazyRetry(() => import("@pages/Packages")));
const Uploads = lazy(() => lazyRetry(() => import("@pages/Uploads")));
const ApiKeys = lazy(() => lazyRetry(() => import("@pages/ApiKeys")));
const AssetEditWrapper = lazy(() =>
  lazyRetry(() => import("@pages/AssetEdit")),
);
const OrgsList = lazy(() => lazyRetry(() => import("@pages/OrgsList")));
const Logout = lazy(() => lazyRetry(() => import("@pages/Logout")));
const FileViewWrapper = lazy(() => lazyRetry(() => import("@pages/FileView")));
const PackageViewWrapper = lazy(() =>
  lazyRetry(() => import("@pages/PackageView")),
);
const QuickSetup = lazy(() => lazyRetry(() => import("@pages/QuickSetup")));
const Welcome = lazy(() => lazyRetry(() => import("@pages/Welcome")));
const ErrorPage = lazy(() => lazyRetry(() => import("@pages/ErrorPage")));
const BabylonScenePage = lazy(() => lazyRetry(() => import("@pages/BabylonScenePage")));

const App: React.FC = () => {
  useOnboarding();

  return (
    <Suspense
      fallback={
        <Stack direction="row" width="100%" justifyContent="center">
          <CircularProgress />
        </Stack>
      }
    >
      <Routes>
        <Route path="*" element={<Layout />} errorElement={<ErrorPage />}>
          <Route index element={<Assets />} />
          <Route
            path="dashboard"
            element={<PrivateRoute component={Dashboard} />}
          />
          <Route
            path="profile"
            element={<PrivateRoute component={ProfileSettings} />}
          />
          <Route
            path="packages"
            element={<PrivateRoute component={Packages} />}
          />
          <Route
            path="uploads"
            element={<PrivateRoute component={Uploads} />}
          />
          <Route
            path="api-keys"
            element={<PrivateRoute component={ApiKeys} />}
          />
          <Route
            path="assets/:asset_id/versions/:version"
            element={<AssetEditWrapper />}
          />

          <Route path="orgs" element={<PrivateRoute component={OrgsList} />} />
          <Route path="logout" element={<Logout />} />
          <Route path="files/:file_id" element={<FileViewWrapper />} />
          <Route
            path="package-view/:asset_id/versions/:version_id"
            element={<PackageViewWrapper />}
          />
          <Route
            path="package-view/:asset_id/versions/:version_id/jobs"
            element={(import.meta.env.VITE_MYTHICA_ENVIRONMENT==="dev")?<PackageScene />:<PackageJobs />}
          />
          <Route path="quick-setup" element={<QuickSetup />} />
          <Route path="welcome" element={<Welcome />} />
          <Route path="demo" element={<BabylonScenePage />} />
        </Route>
      </Routes>
      <Notification />
      <CookieConsentBanner />
      <ProductTour />
    </Suspense>
  );
};

export default App;
