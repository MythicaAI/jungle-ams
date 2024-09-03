import { Meta, StoryObj } from "@storybook/react";
import { Box } from "@mui/joy";
import { PackageViewInfoPanel } from "@components/PackageView/PackageViewInfoPanel";
import { AssetVersionResponse } from "types/apiTypes";
import { BrowserRouter } from "react-router-dom";

const meta: Meta<typeof PackageViewInfoPanel> = {
  title: "Components/PackageViewInfoPanel",
  component: PackageViewInfoPanel,
  decorators: [
    (Story) => (
      <Box sx={{ width: 600, margin: "auto", textAlign: "center" }}>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PackageViewInfoPanel>;

//@ts-expect-error
const mockAssetVersionResponse: AssetVersionResponse = {
  asset_id: "1",
  package_id: "pkg1",
  org_name: "Organization",
  name: "Package1",
  author_name: "Storybook",
  commit_ref:
    "git@github.com:storybook/test-storybook.git/7e9b50f2f9d405b14969edd5b124fb62711b344b",
  description: "This is a sample description for the storybook package.",
  version: [1, 0, 0],
};

export const Default: Story = {
  args: {
    ...mockAssetVersionResponse,
  },
};

export const NoDescription: Story = {
  args: {
    ...mockAssetVersionResponse,
    description: "",
  },
};

export const NoCommitLink: Story = {
  args: {
    ...mockAssetVersionResponse,
    commit_ref: "",
  },
};
