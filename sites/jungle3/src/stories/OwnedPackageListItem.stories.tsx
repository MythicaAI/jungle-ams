import { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  Stack,
  Typography,
  Chip,
  Box,
  Divider as ListDivider,
  ListItemButton,
  ListItemDecorator,
  ListItemContent,
  Switch,
} from "@mui/joy";
import { BrowserRouter, Link } from "react-router-dom";
import { LucidePackage } from "lucide-react";
import { DownloadButton } from "../components/DownloadButton";
import { getThumbnailImg } from "../lib/packagedAssets";
import { AssetVersionResponse } from "../types/apiTypes";
import React from "react";
import { Thumbnail } from "../components/Thumbnail";

const compareVersions = (
  a: AssetVersionResponse,
  b: AssetVersionResponse,
): number => {
  if (b.version[0] !== a.version[0]) return b.version[0] - a.version[0];
  if (b.version[1] !== a.version[1]) return b.version[1] - a.version[1];
  return b.version[2] - a.version[2];
};

const sortVersions = (
  versions: AssetVersionResponse[],
): AssetVersionResponse[] => {
  return versions.sort(compareVersions);
};

// Mock `PackageListItem` component
const OwnedPackageListItem: React.FC<{
  assetId: string;
  versionList: AssetVersionResponse[];
}> = ({ assetId, versionList }) => {
  const sortedVersions = sortVersions(versionList);
  const latestVersion = sortedVersions[0];
  const versionUrl = `/assets/${assetId}/versions/${latestVersion.version.join(".")}`;

  const handlePublishToggle = () => {
    // Handle publish toggle action here
  };

  return (
    <ListItemButton
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
                {latestVersion.package_id && (
                  <DownloadButton
                    icon={<LucidePackage />}
                    file_id={latestVersion.package_id}
                  />
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
              {latestVersion.org_name}::{latestVersion.name}
            </Typography>
            {sortedVersions.map((av, index) => (
              <Chip
                key={av.version.join(".")}
                variant="soft"
                color={index === 0 ? "primary" : "neutral"}
                size="lg"
                component={Link}
                to={`/assets/${av.asset_id}/versions/${av.version.join(".")}`}
                sx={{ borderRadius: "xl" }}
              >
                {av.version.join(".")}
              </Chip>
            ))}
            <Typography level="body-sm" color="neutral">
              by {latestVersion.author_name}
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
              {latestVersion.published ? "Published" : "Draft"}
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

// Mock data
const mockVersionList: AssetVersionResponse[] = [
  //@ts-expect-error
  {
    asset_id: "asset_2039j2i30epoimp",
    package_id: "pkg1",
    org_name: "Storybook",
    name: "Test package",
    author_name: "Storybook",
    commit_ref: "git@github.com:storybook/storybook.git/commit/123456789123123",
    description: "A description of storybook component.",
    version: [1, 0, 0],
    published: true,
  },
];

const meta: Meta<typeof OwnedPackageListItem> = {
  title: "Components/OwnedPackageListItem",
  component: OwnedPackageListItem,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Box sx={{ width: "100%", maxWidth: "1200px", margin: "auto" }}>
          <Story />
        </Box>
      </BrowserRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OwnedPackageListItem>;

export const Default: Story = {
  args: {
    assetId: "1",
    versionList: mockVersionList,
  },
};

export const MultipleVersions: Story = {
  args: {
    assetId: "2",

    versionList: [
      //@ts-expect-error
      ...mockVersionList,
      //@ts-expect-error
      {
        asset_id: "asset_qowidj23pdj9oiasmdpoij",
        package_id: "pkg2",
        org_name: "Storybook",
        name: "Test package 2",
        author_name: "Storybook",
        commit_ref: "git@github.com:storybook/dall-e/commit/abcdef12123123123",
        description: "A description of storybook component",
        version: [2, 0, 0],
        published: false,
      },
    ],
  },
};
