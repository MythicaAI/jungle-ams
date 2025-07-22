import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  List,
  ListDivider,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Stack,
  Switch,
  Typography,
} from "@mui/joy";
import { AssetCreateRequest, AssetVersionResponse } from "types/apiTypes";
import { AxiosError } from "axios";
import {
  extractValidationErrors,
  translateError,
} from "@services/backendCommon";
import { useStatusStore } from "@store/statusStore";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LucidePackage, LucidePlusCircle } from "lucide-react";
import { useAssetVersionStore } from "@store/assetVersionStore";
import { DownloadButton } from "@components/common/DownloadButton";
import { getThumbnailImg } from "@lib/packagedAssets";
import { Thumbnail } from "@components/Thumbnail";
import {
  useCreateAsset,
  useGetOwnedPackages,
  usePublishToggle,
} from "@queries/packages";
import { useTranslation } from "react-i18next";

type VersionCache = { [key: string]: [AssetVersionResponse] };

const Packages = () => {
  const { data: versions, isLoading, error } = useGetOwnedPackages();
  const { mutate: togglePublish } = usePublishToggle();
  const { mutate: createAssetMutation } = useCreateAsset();
  const [versionCache, setVersionCache] = useState<VersionCache>({});
  const { t } = useTranslation();

  const { addError, addWarning } = useStatusStore();
  const { updateVersion, clearVersion } = useAssetVersionStore();
  const navigate = useNavigate();

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  const handlePublishToggle = (
    asset_id: string,
    version: string,
    published: boolean,
  ) => {
    togglePublish(
      { asset_id, version, published },
      { onError: (err) => handleError(err as any) },
    );
  };

  const compareVersions = (
    a: AssetVersionResponse,
    b: AssetVersionResponse,
  ): number => {
    if (b.version[0] !== a.version[0]) return b.version[0] - a.version[0]; // Compare major versions
    if (b.version[1] !== a.version[1]) return b.version[1] - a.version[1]; // Compare minor versions
    return b.version[2] - a.version[2]; // Compare patch versions
  };

  const sortVersions = (
    versions: AssetVersionResponse[],
  ): AssetVersionResponse[] => {
    return versions.sort(compareVersions);
  };

  const createAsset = function () {
    const createRequest: AssetCreateRequest = {};
    createAssetMutation(createRequest, {
      onSuccess: (res) => {
        clearVersion();
        updateVersion({
          asset_id: res.asset_id,
          org_id: res.org_id,
          version: [1, 0, 0],
        });

        navigate(`/assets/${res.asset_id}/versions/1.0.0`);
      },
      onError: (err) => handleError(err as any),
    });
  };

  // set the {versions} list and index each asset to a list of versions
  // in the {versionCache}
  const updateVersionCache = (versions: AssetVersionResponse[]) => {
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
    if (versions) {
      updateVersionCache(versions as AssetVersionResponse[]);
    }
  }, [versions]);

  useEffect(() => {
    if (error) {
      handleError(error as any);
    }
  }, [error]);

  useEffect(() => {
    clearVersion();
  }, []);

  const renderLatestVersion = (
    assetId: string,
    versionList: AssetVersionResponse[],
  ) => {
    const sortedVersions = sortVersions(versionList);
    const latestVersion = sortedVersions[0];
    const versionUrl = `/assets/${assetId}/versions/${latestVersion.version.join(
      ".",
    )}`;
    return (
      <ListItemButton
        key={assetId}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          ":hover": { backgroundColor: "transparent !important" },
        }}
      >
        <Card
          sx={{
            flexDirection: { xs: "column", md: "row" },
            width: "100%",
            cursor: "auto",
            justifyContent: {
              xs: "flex-start !important",
              md: "space-between !important",
            },
          }}
        >
          <Stack direction={{ xs: "row", sm: "row" }} gap="30px">
            <Stack direction={{ xs: "column-reverse", sm: "row" }} gap="10px">
              <ListItemDecorator sx={{ display: { xs: "none", md: "flex" } }}>
                <Stack spacing={1} alignItems="center">
                  <Link to={versionUrl}></Link>
                  {latestVersion.package_id ? (
                    <DownloadButton
                      icon={<LucidePackage />}
                      file_id={latestVersion.package_id}
                    />
                  ) : (
                    ""
                  )}
                </Stack>
              </ListItemDecorator>
              <ListItemDecorator>
                <Thumbnail
                  src={getThumbnailImg(latestVersion)}
                  alt={latestVersion.name}
                />
              </ListItemDecorator>
            </Stack>
            <ListDivider
              sx={{ display: { xs: "none", sm: "block" } }}
              orientation={"vertical"}
            />
            <ListItemContent sx={{ flex: 1 }}>
              <Typography
                component={Link}
                to={versionUrl}
                level="body-md"
                fontWeight="bold"
              >
                {latestVersion.name}
              </Typography>
              {sortedVersions.map((av, index) => (
                <Chip
                  key={av.version.join(".")}
                  variant="soft"
                  color={index == 0 ? "primary" : "neutral"}
                  size="lg"
                  component={Link}
                  to={`/assets/${av.asset_id}/versions/${av.version.join(".")}`}
                  sx={{ borderRadius: "xl" }}
                >
                  {av.version.join(".")}
                </Chip>
              ))}
              <Typography level="body-sm" color="neutral">
                by {latestVersion.owner_name}{" "}
                {latestVersion.org_name
                  ? "[" + latestVersion.org_name + "]"
                  : ""}
              </Typography>
            </ListItemContent>
          </Stack>
          <Stack
            direction={{ md: "row", xs: "column" }}
            gap="10px"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <ListDivider
              orientation={"vertical"}
              sx={{ display: { xs: "none", sm: "block" } }}
            />
            <Typography fontFamily={"code"} level={"body-xs"}>
              {assetId}
            </Typography>

            <Stack direction="row" alignItems="center">
              {latestVersion.package_id && (
                <Box display={{ xs: "block", md: "none" }}>
                  <DownloadButton
                    icon={<LucidePackage />}
                    file_id={latestVersion.package_id}
                  />
                </Box>
              )}
              <Typography
                component="span"
                level="body-md"
                sx={{
                  textAlign: "right",
                  width: "auto",
                  mr: "5px",
                }}
              >
                {latestVersion.published
                  ? t("common.published")
                  : t("common.draft")}
              </Typography>
              <Switch
                checked={latestVersion.published}
                onChange={(event) =>
                  handlePublishToggle(
                    assetId,
                    latestVersion.version.join("."),
                    event.target.checked,
                  )
                }
                color={latestVersion.published ? "success" : "neutral"}
                sx={{ flex: 1 }}
              />
            </Stack>
          </Stack>
        </Card>
      </ListItemButton>
    );
  };

  return (
    <Box height="100%">
      <Helmet>
        <title>Mythica • {t("common.profileMenu.myPackages")}</title>
      </Helmet>
      <Card sx={{ margin: "0 16px" }}>
        <Stack>
          <Typography textAlign="start" level="h4">
            {t("myPackages.title")}
          </Typography>
          <Typography textAlign="start">
            {t("myPackages.description")}
          </Typography>
        </Stack>
      </Card>
      <List size={"lg"}>
        <ListItem key={"create-header"}>
          <ListItemDecorator>
            <Button
              component="label"
              variant={"plain"}
              color={"neutral"}
              onClick={createAsset}
              startDecorator={<LucidePlusCircle />}
              sx={{ padding: "6px 8px" }}
            >
              {t("myPackages.createNew")}
            </Button>
          </ListItemDecorator>
        </ListItem>

        {isLoading ? (
          <Stack direction="row" width="100%" justifyContent="center">
            <CircularProgress />
          </Stack>
        ) : (
          Object.entries(versionCache).map(([assetId, versionList]) =>
            renderLatestVersion(assetId, versionList),
          )
        )}
        {Object.entries(versionCache).length === 0 && (
          <Card sx={{ margin: "0 16px" }}>
            <Typography textAlign="left">
              You don't have any packages yet.
            </Typography>
          </Card>
        )}
      </List>
    </Box>
  );
};

export default Packages;
