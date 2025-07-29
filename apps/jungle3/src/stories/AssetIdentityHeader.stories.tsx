import { Meta, StoryObj } from "@storybook/react";
import { AssetIdentityHeader } from "@components/AssetIdentityHeader";
import { useAssetVersionStore } from "@store/assetVersionStore";

const meta: Meta<typeof AssetIdentityHeader> = {
  title: "Components/AssetIdentityHeader",
  component: AssetIdentityHeader,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof AssetIdentityHeader>;

export const Default: Story = {
  decorators: [
    (Story) => {
      useAssetVersionStore.setState({
        asset_id: "1234567890",
        org_id: "org-42",
      });
      return <Story />;
    },
  ],
};
