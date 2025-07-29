import { Meta, StoryObj } from "@storybook/react";
import PackageViewCarousel from "@components/PackageView/PackageViewCarousel";
import { Box } from "@mui/joy";
import { AssetVersionResponse } from "types/apiTypes";

const meta: Meta<typeof PackageViewCarousel> = {
  title: "Components/PackageViewCarousel",
  component: PackageViewCarousel,
  decorators: [
    (Story) => (
      <Box sx={{ width: 600 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PackageViewCarousel>;

//@ts-expect-error
const mockAssetVersionResponse: AssetVersionResponse = {
  contents: {
    thumbnails: [
      {
        file_id: "file_qfJSVuWRJvmkJzRo8pVWpEUJMJZ",
        file_name: "thumbnails\\florist.gif",
        content_hash: "99604b1b34ab6224f1830ceacfb33686eb6c2184",
        size: 1526417,
      },
      {
        file_id: "file_qfJSVuWRJvkjj4ZzEEF1gN2kiWg",
        file_name: "thumbnails\\thumbnail_01.png",
        content_hash: "f6bb7b803baa2bc3a5ac49787ac43407a48face1",
        size: 264985,
      },
      {
        file_id: "file_qfJSVuWRJvqJK7BLARheMJnVXLp",
        file_name: "thumbnails\\thumbnail_02.png",
        content_hash: "0cdad291ebc3bb2dd9247f91d61823d3f34dc9b5",
        size: 279515,
      },
      {
        file_id: "file_qfJSVuWRJvpr7RXiDJDKnneWtyk",
        file_name: "thumbnails\\thumbnail_03.png",
        content_hash: "86224f4cdf617c49865637fde8ed1fafd3e3c126",
        size: 255563,
      },
      {
        file_id: "file_qfJSVuWRJvnSYnd8HKj9tLS3bGA",
        file_name: "thumbnails\\thumbnail_04.png",
        content_hash: "6bd4dcccff8bd6221cbb707b90e7f0dcc6fee7c6",
        size: 278519,
      },
      {
        file_id: "file_qfJSVuWRJvoKrCBTxNve4eqebjE",
        file_name: "thumbnails\\thumbnail_05.png",
        content_hash: "4fe74017c5a0917f8967031378ff74550ccec464",
        size: 253053,
      },
      {
        file_id: "file_qfJSVuWRJvm4NLeRpo5KL1a9yj8",
        file_name: "thumbnails\\thumbnail_06.png",
        content_hash: "945a7651ef218df4463b90e1862ee8006ae5be21",
        size: 75595,
      },
    ],
  },
};

export const Default: Story = {
  args: {
    ...mockAssetVersionResponse,
  },
};
