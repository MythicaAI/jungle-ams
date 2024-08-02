import {
  Button,
  Grid,
  Sheet,
  Tabs,
  TabList,
  Tab,
  Box,
  TabPanel,
} from "@mui/joy";
import { useGlobalStore } from "./stores/globalStore.ts";
import { useEffect } from "react";
import { useAssetVersionStore } from "./stores/assetVersionStore.ts";
import {
  extractValidationErrors,
  translateError,
} from "./services/backendCommon.ts";
import { useStatusStore } from "./stores/statusStore.ts";
import { AxiosError } from "axios";
import { Helmet } from "react-helmet-async";
import {
  AssetVersionContentListMap,
  AssetVersionResponse,
} from "./types/apiTypes.ts";
import { useParams, useNavigate } from "react-router-dom";
import { AssetIdentityHeader } from "./components/AssetIdentityHeader.tsx";
import { isVersionZero, sanitizeVersion } from "./types/assetEditTypes.ts";
import { AssetEditPageHeader } from "./components/AssetEditPageHeader.tsx";
import { AssetEditDetailControls } from "./components/AssetEditDetailControls.tsx";
import { AssetEditListControls } from "./components/AssetEditListControls.tsx";
import { api } from "./services/api/index.ts";

interface AssetEditProps {
  assetId?: string;
  version?: string;
}

export const AssetEdit: React.FC<AssetEditProps> = ({
  assetId: propAssetId = undefined,
  version: propVersion = "0.0.0",
}) => {
  const { orgRoles } = useGlobalStore();
  const { setSuccess, addError, addWarning } = useStatusStore();
  const {
    asset_id,
    name,
    org_id,
    version,
    published,
    description,
    files,
    thumbnails,
    addFiles,
    addThumbnails,
    updateVersion,
  } = useAssetVersionStore();
  const navigate = useNavigate();

  // org_id state and initial update to first index
  useEffect(() => {
    if (orgRoles && orgRoles.length > 0 && orgRoles[0].org_id) {
      updateVersion({ org_id: orgRoles[0].org_id });
    }
  }, [orgRoles]);

  // handle populating the form if an asset ID was specified
  useEffect(() => {
    if (!propAssetId) {
      return;
    }
    api
      .get<AssetVersionResponse>({
        path: `/assets/${propAssetId}/versions/${propVersion}`,
      })
      .then((r) => {
        loadAssetVersionResponse(r);
      })
      .catch((err) => handleError(err));
  }, [propAssetId, propVersion]);

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  const loadAssetVersionResponse = (r: AssetVersionResponse) => {
    console.log(`loading asset version ${r.asset_id} ${r.version.join(".")}`);

    const sanitized = sanitizeVersion(r.version);

    // clear files and replace with version response
    updateVersion({
      asset_id: r.asset_id,
      org_id: r.org_id || "",
      author_id: r.author_id || "",
      package_id: r.package_id || "",
      name: r.name || "",
      description: r.description || "",
      version: sanitized,
      commit_ref: r.commit_ref || "",
      created: r.created || "",
      updated: r.updated,
      files: {},
      thumbnails: {},
      links: [],
    });

    if (r.contents) {
      const contentMap: AssetVersionContentListMap = r.contents;
      if ("files" in contentMap) {
        addFiles(contentMap["files"]);
      }
      if ("thumbnails" in contentMap) {
        addThumbnails(contentMap["thumbnails"]);
      }
    }
  };

  // handle form submit for the specified version
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sanitizedVersion = sanitizeVersion(version);

    const formJson: { [key: string]: string | object } = {};
    formJson["contents"] = {
      files: Object.values(files),
      thumbnails: Object.values(thumbnails),
    };
    formJson["description"] = description;
    formJson["name"] = name;
    formJson["org_id"] = org_id;
    formJson["published"] = String(published);
    formJson["version"] = sanitizedVersion;

    if (isVersionZero(sanitizedVersion)) {
      addError("Zero versions are not supported");
      return;
    }

    api
      .post<AssetVersionResponse>({
        path: `/assets/${asset_id}/versions/${sanitizedVersion.join(".")}`,
        body: formJson,
      })
      .then((r) => {
        loadAssetVersionResponse(r);
        setSuccess(`${r.name}, ${r.version.join(".")} updated`);
        navigate("/packages");
      })
      .catch((err) => handleError(err));
  };

  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 1000,
        mx: "auto", // margin left & right
        my: 4, // margin top & bottom
        py: 3, // padding top & bottom
        px: 2, // padding left & right
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: "sm",
        boxShadow: "md",
      }}
    >
      <Helmet>
        <title>Mythica • Edit package</title>
      </Helmet>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          <Grid xs={12}>
            <AssetEditPageHeader />
          </Grid>
          <Grid xs={12}>
            <AssetIdentityHeader />
          </Grid>

          <Tabs aria-label="Basic tabs" defaultValue={0} sx={{ width: "100%" }}>
            <TabList>
              <Tab>Details</Tab>
              <Tab>Files</Tab>
              <Tab>Thumbnails</Tab>
            </TabList>

            <TabPanel value={0}>
              <AssetEditDetailControls />
            </TabPanel>

            <TabPanel value={1}>
              <AssetEditListControls category="files" />
            </TabPanel>

            <TabPanel value={2}>
              <AssetEditListControls category="thumbnails" />
            </TabPanel>
          </Tabs>

          <Box
            component="div"
            mt="20px"
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Button type="submit">Update</Button>
          </Box>
        </Grid>
      </form>
    </Sheet>
  );
};

export const AssetEditWrapper: React.FC = () => {
  const { asset_id, version } = useParams();
  return <AssetEdit assetId={asset_id} version={version} />;
};
