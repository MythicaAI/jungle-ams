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
import { useGlobalStore } from "@store/globalStore";
import { useEffect } from "react";
import { useAssetVersionStore } from "@store/assetVersionStore";
import {
  extractValidationErrors,
  translateError,
} from "@services/backendCommon";
import { useStatusStore } from "@store/statusStore";
import { Helmet } from "react-helmet-async";
import {
  AssetVersionContentListMap,
  AssetVersionResponse,
} from "types/apiTypes";
import { useParams, useNavigate } from "react-router-dom";
import { isVersionZero, sanitizeVersion } from "types/assetEditTypes";
import {
  AssetEditPageHeader,
  AssetEditDetailControls,
  AssetEditListControls,
  AssetEditLinks,
} from "@components/AssetEdit";
import { useGetAssetByVersion, useUpdateAsset } from "@queries/packages";
import { useTranslation } from "react-i18next";
import {
  useAssignTagToAsset,
  useCreateAssetTag,
  useGetAssetTags,
  useRemoveTagFromAsset,
} from "@queries/tags";

interface AssetEditProps {
  assetId?: string;
  version?: string;
}

const AssetEdit: React.FC<AssetEditProps> = ({
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
    setLinks,
    updateVersion,
    links,
    tag,
    initialTag,
    customTag,
  } = useAssetVersionStore();
  const navigate = useNavigate();
  const { data: assetData, error } = useGetAssetByVersion(
    propAssetId,
    propVersion,
  );
  const { mutate: updateAsset } = useUpdateAsset();
  const { t } = useTranslation();
  const { data: tags, error: tagsError } = useGetAssetTags();
  const { mutate: assignTagToAsset, isPending: isAssignTagToAssetLoading } =
    useAssignTagToAsset();
  const { mutate: createTag, isPending: isCreateTagLoading } =
    useCreateAssetTag();
  const { mutate: removeTagFromAsset, isPending: isRemoveTagFromAssetLoading } =
    useRemoveTagFromAsset();

  // org_id state and initial update to first index
  useEffect(() => {
    if (orgRoles && orgRoles.length > 0 && orgRoles[0].org_id) {
      updateVersion({ org_id: orgRoles[0].org_id });
    }
  }, [orgRoles]);

  // handle populating the form if an asset ID was specified
  useEffect(() => {
    if (error) {
      handleError(error);
    }

    if (tagsError) {
      handleError(tagsError);
    }

    if (assetData) {
      loadAssetVersionResponse(assetData);
    }
  }, [assetData, error, tagsError]);

  const handleError = (err: any) => {
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
      published: r.published,
      initialTag: r.tags && r.tags.length > 0 ? r.tags[0] : undefined,
      tag: r.tags && r.tags.length > 0 ? r.tags[0].tag_id : undefined,
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
      if ("links" in contentMap) {
        const formattedLinks = contentMap["links"].map((item, idx) => ({
          name: `linkInput-${idx}`,
          value: item as unknown as string,
        }));

        setLinks(formattedLinks);
      }
    }
  };

  // handle form submit for the specified version
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sanitizedVersion = sanitizeVersion(version);
    const filteredLinks = links.filter((link) => link.value !== "");
    const formattedLinks =
      filteredLinks && filteredLinks.length > 0
        ? filteredLinks.map((link) => link.value)
        : null;

    const formJson: { [key: string]: string | object } = {};

    formJson["contents"] = {
      files: Object.values(files),
      thumbnails: Object.values(thumbnails),
    };

    if (formattedLinks) {
      formJson["contents"] = {
        files: Object.values(files),
        thumbnails: Object.values(thumbnails),
        links: formattedLinks,
      };
    }

    formJson["description"] = description;
    formJson["name"] = name;
    formJson["org_id"] = org_id;
    formJson["published"] = String(published);
    formJson["version"] = sanitizedVersion;

    if (isVersionZero(sanitizedVersion)) {
      addError("Zero versions are not supported");
      return;
    }

    const handleUpdate = () => {
      if (
        isCreateTagLoading ||
        isAssignTagToAssetLoading ||
        isRemoveTagFromAssetLoading
      )
        return;

      updateAsset(
        {
          payload: formJson,
          assetId: asset_id,
          assetVersion: sanitizedVersion.join("."),
        },
        {
          onSuccess: (r) => {
            console.log("qqq");
            loadAssetVersionResponse(r);
            setSuccess(`${r.name}, ${r.version.join(".")} updated`);
            navigate("/packages");
          },
          onError: (err) => handleError(err),
        },
      );
    };

    const isTagDifferentFromInitial =
      initialTag &&
      ((customTag && initialTag.tag_name !== customTag) ||
        (tag && initialTag.tag_id !== tag));

    if (isTagDifferentFromInitial && customTag) {
      return createTag(customTag, {
        onSuccess: (res) => {
          removeTagFromAsset(
            { tag_id: initialTag?.tag_id, type_id: asset_id },
            {
              onSuccess: () => {
                assignTagToAsset(
                  { tag_id: res?.tag_id, type_id: asset_id },
                  {
                    onSettled: () => {
                      handleUpdate();
                    },
                  },
                );
              },
            },
          );
        },
        onError: (err) => {
          handleUpdate();
          handleError(err);
        },
      });
    }

    if (isTagDifferentFromInitial && tag && !customTag) {
      return assignTagToAsset(
        { tag_id: tag, type_id: asset_id },
        {
          onSuccess: () => {
            removeTagFromAsset(
              {
                tag_id: initialTag?.tag_id,
                type_id: asset_id,
              },
              {
                onSettled: () => {
                  handleUpdate();
                },
              },
            );
          },
          onError: (err) => {
            handleUpdate();
            handleError(err);
          },
        },
      );
    }

    if (customTag && !initialTag) {
      return createTag(customTag, {
        onSuccess: (res) =>
          assignTagToAsset(
            { tag_id: res?.tag_id, type_id: asset_id },
            {
              onSettled: () => {
                handleUpdate();
              },
            },
          ),
        onError: (err) => {
          handleError(err);
          handleUpdate();
        },
      });
    }

    if (tag && !customTag && !initialTag) {
      return assignTagToAsset(
        { tag_id: tag, type_id: asset_id },
        {
          onSettled: () => {
            handleUpdate();
          },
        },
      );
    }

    handleUpdate();
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
        <title>Mythica • {t("packageEdit.editPackage")}</title>
      </Helmet>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          <Grid xs={12}>
            <AssetEditPageHeader />
          </Grid>

          <Tabs aria-label="Basic tabs" defaultValue={0} sx={{ width: "100%" }}>
            <TabList>
              <Tab>{t("packageEdit.details")}</Tab>
              <Tab>{t("packageEdit.files")}</Tab>
              <Tab>{t("packageEdit.thumbnails")}</Tab>
              <Tab>{t("packageEdit.links")}</Tab>
            </TabList>

            <TabPanel value={0}>
              <AssetEditDetailControls tags={tags} />
            </TabPanel>

            <TabPanel value={1}>
              <AssetEditListControls category="files" />
            </TabPanel>

            <TabPanel value={2}>
              <AssetEditListControls category="thumbnails" />
            </TabPanel>

            <TabPanel value={3}>
              <AssetEditLinks />
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

const AssetEditWrapper: React.FC = () => {
  const { asset_id, version } = useParams();
  return <AssetEdit assetId={asset_id} version={version} />;
};

export default AssetEditWrapper;
