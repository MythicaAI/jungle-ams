import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  List,
  ListDivider,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Stack,
  Switch,
  Typography,
} from '@mui/joy';
import {
  AssetCreateRequest,
  AssetCreateResponse,
  AssetVersionResponse,
} from './types/apiTypes.ts';
import { AxiosError } from 'axios';
import {
  extractValidationErrors,
  getData,
  postData,
  translateError,
} from './services/backendCommon.ts';
import { useGlobalStore } from './stores/globalStore.ts';
import { useStatusStore } from './stores/statusStore.ts';
import { Link, useNavigate } from 'react-router-dom';
import { LucidePackage, LucidePlusCircle } from 'lucide-react';
import { useAssetVersionStore } from './stores/assetVersionStore.ts';
import { DownloadButton } from './components/DownloadButton/index.tsx';
import {getThumbnailImg} from "./lib/packagedAssets.tsx";
import {Thumbnail} from "./components/Thumbnail.tsx";

type VersionCache = { [key: string]: [AssetVersionResponse] };

export const Packages = () => {
  const [versions, setVersions] = useState<AssetVersionResponse[]>([]);
  const [versionCache, setVersionCache] = useState<VersionCache>({});

  const { authToken } = useGlobalStore();
  const { addError, addWarning } = useStatusStore();
  const { asset_id, updateVersion, clearVersion } = useAssetVersionStore();
  const navigate = useNavigate();

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  const assetVersionsEqual = (
    a: AssetVersionResponse,
    b: AssetVersionResponse
  ) => {
    return (
      a.asset_id === b.asset_id &&
      a.version[0] === b.version[0] &&
      a.version[1] === b.version[1] &&
      a.version[2] === b.version[2]
    );
  };

  // update the versions list, replace only the provided asset version response
  const updateAssetVersion = (a: AssetVersionResponse) => {
    setVersions(
      versions.map((value) => (assetVersionsEqual(a, value) ? a : value))
    );
  };

  const handlePublishToggle = (
    asset_id: string,
    version: string,
    published: boolean
  ) => {
    console.log('publish toggle:', asset_id, published);
    postData<AssetVersionResponse>(`assets/${asset_id}/versions/${version}`, {
      published: published,
    })
      .then((r) => {
        updateAssetVersion(r as AssetVersionResponse);
      })
      .catch((err) => handleError(err));
  };

  const compareVersions = (
    a: AssetVersionResponse,
    b: AssetVersionResponse
  ): number => {
    if (b.version[0] !== a.version[0]) return b.version[0] - a.version[0]; // Compare major versions
    if (b.version[1] !== a.version[1]) return b.version[1] - a.version[1]; // Compare minor versions
    return b.version[2] - a.version[2]; // Compare patch versions
  };

  const sortVersions = (
    versions: AssetVersionResponse[]
  ): AssetVersionResponse[] => {
    return versions.sort(compareVersions);
  };

  const createAsset = function () {
    if (!asset_id || asset_id === '') {
      const createRequest: AssetCreateRequest = {};
      postData<AssetCreateResponse>('assets/', createRequest)
        .then((r) => {
          // update the asset edit state
          clearVersion();
          updateVersion({
            asset_id: r.id,
            org_id: r.org_id,
          });
          navigate(`/assets/${r.id}/versions/0.0.0`);
        })
        .catch((err) => handleError(err));
    }
  };

  // set the {versions} list and index each asset to a list of versions
  // in the {versionCache}
  const updateVersionCache = (versions: AssetVersionResponse[]) => {
    setVersions(versions);
    const newVersionCache: VersionCache = {};
    versions.forEach((v) => {
      const existingVersions = newVersionCache[v.asset_id];
      if (!existingVersions) {
        newVersionCache[v.asset_id] = [v];
      } else {
        newVersionCache[v.asset_id].push(v);
      }
    });
    setVersionCache(newVersionCache);
  };

  useEffect(() => {
    updateVersionCache(versions);
  }, [versions]);

  useEffect(() => {
    console.log('packages: load owned assets');
    if (!authToken) {
      return;
    }
    getData<AssetVersionResponse[]>('assets/owned')
      .then((r) => setVersions(r))
      .catch((err) => handleError(err));
  }, [authToken]);

  const renderLatestVersion = (
    assetId: string,
    versionList: AssetVersionResponse[]
  ) => {
    const sortedVersions = sortVersions(versionList);
    const latestVersion = sortedVersions[0];
    const versionUrl = `/assets/${assetId}/versions/${latestVersion.version.join(
      '.'
    )}`;
    return (
      <ListItemButton
        key={assetId}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ListItemDecorator>
          <Stack spacing={1} alignItems="center">
            <Link to={versionUrl}></Link>
            {latestVersion.package_id ? (
              <DownloadButton
                icon={<LucidePackage />}
                file_id={latestVersion.package_id}
              />
            ) : (
              ''
            )}
          </Stack>
        </ListItemDecorator>
        <ListItemDecorator>
          <Thumbnail src={getThumbnailImg(latestVersion)} alt={latestVersion.name} />
        </ListItemDecorator>
        <ListDivider orientation={'vertical'} />
        <ListItemContent sx={{ flex: 1 }}>
          <Typography
            component={Link}
            to={versionUrl}
            level="body-md"
            fontWeight="bold"
          >
            {latestVersion.org_name}::{latestVersion.name}
          </Typography>
          {sortedVersions.map((av, index) => (
            <Chip
              key={av.version.join('.')}
              variant="soft"
              color={index == 0 ? 'primary' : 'neutral'}
              size="lg"
              component={Link}
              to={`/assets/${av.asset_id}/versions/${av.version.join('.')}`}
              sx={{ borderRadius: 'xl' }}
            >
              {av.version.join('.')}
            </Chip>
          ))}
          <Typography level="body-sm" color="neutral">
            by {latestVersion.author_name}
          </Typography>
        </ListItemContent>
        <ListDivider orientation={'vertical'} />
        <ListItemDecorator>
          <Typography fontFamily={'code'} level={'body-xs'}>
            {assetId}
          </Typography>
        </ListItemDecorator>
        <ListItemDecorator>
          <Typography
            component="span"
            level="body-md"
            sx={{
              textAlign: 'right',
              ml: '10px',
              width: 'auto',
              minWidth: '100px',
            }}
          >
            {latestVersion.published ? 'Published' : 'Draft'}
          </Typography>
          <Switch
            checked={latestVersion.published}
            onChange={(event) =>
              handlePublishToggle(
                assetId,
                latestVersion.version.join('.'),
                event.target.checked
              )
            }
            color={latestVersion.published ? 'success' : 'neutral'}
            sx={{ flex: 1 }}
          />
        </ListItemDecorator>
      </ListItemButton>
    );
  };

  return (
    <Box>
      <List size={'lg'}>
        <ListItem key={'create-header'}>
          <ListItemDecorator>
            <Button
              component="label"
              variant={'plain'}
              color={'neutral'}
              onMouseDown={createAsset}
              startDecorator={<LucidePlusCircle />}
            >
              Create New Package
            </Button>
          </ListItemDecorator>
        </ListItem>
        {Object.entries(versionCache).map(([assetId, versionList]) =>
          renderLatestVersion(assetId, versionList)
        )}
      </List>
    </Box>
  );
};
