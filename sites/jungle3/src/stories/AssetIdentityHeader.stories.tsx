import { Meta, StoryObj } from "@storybook/react";
import { AssetIdentityHeader } from "@components/AssetIdentityHeader";
import { useAssetVersionStore } from "@store/assetVersionStore";

// Define the Storybook metadata
const meta: Meta<typeof AssetIdentityHeader> = {
  title: "Components/AssetIdentityHeader",
  component: AssetIdentityHeader,
  parameters: {
    layout: "centered", // You can change the layout if needed
  },
};

export default meta;

type Story = StoryObj<typeof AssetIdentityHeader>;

// Define the default story
export const Default: Story = {
  decorators: [
    (Story) => {
      // Mock Zustand store values before rendering the story
      useAssetVersionStore.setState({
        asset_id: "1234567890",
        org_id: "org-42",
      });
      return <Story />;
    },
  ],
};
