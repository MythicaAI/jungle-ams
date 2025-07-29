import { Meta, StoryObj } from "@storybook/react";
import { PackageViewCard } from "@components/PackageViewCard";
import { BrowserRouter } from "react-router-dom";
import { Box } from "@mui/joy";
import { AssetTopResponse } from "types/apiTypes";
import {queryClient} from "../queryClient.ts";
import {QueryClientProvider} from "@tanstack/react-query";

const meta: Meta<typeof PackageViewCard> = {
  title: "Components/PackageViewCard",
  component: PackageViewCard,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Box sx={{ width: 300 }}>
            <Story />
          </Box>
        </BrowserRouter>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PackageViewCard>;

//@ts-expect-error
const mockAsset: AssetTopResponse = {
  org_name: "Sample Org",
  name: "Sample Package",
  asset_id: "sample-asset-id",
  package_id: "sample-package-id",
  version: [1, 0, 0],
};

export const Default: Story = {
  args: {
    av: mockAsset,
    sxStyles: {
      justifyContent: "flex-start",
    },
  },
};

export const WithoutExplicitHeight: Story = {
  args: {
    av: mockAsset,
    isTopAsset: true,
    sxStyles: {
      justifyContent: "center",
    },
  },
};
