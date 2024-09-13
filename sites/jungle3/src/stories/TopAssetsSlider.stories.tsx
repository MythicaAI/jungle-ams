import { Meta, StoryObj } from "@storybook/react";
import { TopAssetsSlider } from "@components/TopAssetsCarousel/TopAssetsSlider";
import { AssetTopResponse } from "types/apiTypes";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../queryClient";

const meta: Meta<typeof TopAssetsSlider> = {
  title: "Components/TopAssetsSlider",
  component: TopAssetsSlider,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </BrowserRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TopAssetsSlider>;

const mockAssets: AssetTopResponse[] = [
  {
    asset_id: "1",
    owner_id: "100",
    owner_name: "Owner One",
    org_id: "500",
    org_name: "Org One",
    package_id: "200",
    author_id: "300",
    author_name: "Author One",
    name: "Asset 1",
    description: "This is a description for Asset 1",
    version: [1, 0, 0],
    commit_ref: "abcd1234",
    published: true,
    created: "2023-09-01T12:00:00Z",
    updated: "2023-09-05T12:00:00Z",
    contents: {},
    downloads: 150,
    versions: [
      [1, 0, 0],
      [1, 0, 1],
    ],
  },
  {
    asset_id: "2",
    owner_id: "101",
    owner_name: "Owner Two",
    org_id: "501",
    org_name: "Org Two",
    package_id: "201",
    author_id: "301",
    author_name: "Author Two",
    name: "Asset 2",
    description: "This is a description for Asset 2",
    version: [1, 0, 1],
    commit_ref: "efgh5678",
    published: true,
    created: "2023-09-02T12:00:00Z",
    updated: "2023-09-06T12:00:00Z",
    contents: {},
    downloads: 120,
    versions: [
      [1, 0, 0],
      [1, 0, 1],
    ],
  },
  {
    asset_id: "3",
    owner_id: "102",
    owner_name: "Owner Three",
    org_id: "502",
    org_name: "Org Three",
    package_id: "202",
    author_id: "302",
    author_name: "Author Three",
    name: "Asset 3",
    description: "This is a description for Asset 3",
    version: [1, 0, 2],
    commit_ref: "ijkl9012",
    published: false,
    created: "2023-09-03T12:00:00Z",
    updated: "2023-09-07T12:00:00Z",
    contents: {},
    downloads: 180,
    versions: [
      [1, 0, 0],
      [1, 0, 1],
      [1, 0, 2],
    ],
  },
  {
    asset_id: "3",
    owner_id: "102",
    owner_name: "Owner Four",
    org_id: "502",
    org_name: "Org Four",
    package_id: "202",
    author_id: "302",
    author_name: "Author Four",
    name: "Asset 4",
    description: "This is a description for Asset 4",
    version: [1, 0, 2],
    commit_ref: "ijkl9012",
    published: false,
    created: "2023-09-03T12:00:00Z",
    updated: "2023-09-07T12:00:00Z",
    contents: {},
    downloads: 180,
    versions: [
      [1, 0, 0],
      [1, 0, 1],
      [1, 0, 2],
    ],
  },
  {
    asset_id: "3",
    owner_id: "102",
    owner_name: "Owner Five",
    org_id: "502",
    org_name: "Org Five",
    package_id: "202",
    author_id: "302",
    author_name: "Author Five",
    name: "Asset 5",
    description: "This is a description for Asset 5",
    version: [1, 0, 2],
    commit_ref: "ijkl9012",
    published: false,
    created: "2023-09-03T12:00:00Z",
    updated: "2023-09-07T12:00:00Z",
    contents: {},
    downloads: 180,
    versions: [
      [1, 0, 0],
      [1, 0, 1],
      [1, 0, 2],
    ],
  },
  {
    asset_id: "3",
    owner_id: "102",
    owner_name: "Owner Six",
    org_id: "502",
    org_name: "Org Six",
    package_id: "202",
    author_id: "302",
    author_name: "Author Six",
    name: "Asset 6",
    description: "This is a description for Asset 6",
    version: [1, 0, 2],
    commit_ref: "ijkl9012",
    published: false,
    created: "2023-09-03T12:00:00Z",
    updated: "2023-09-07T12:00:00Z",
    contents: {},
    downloads: 180,
    versions: [
      [1, 0, 0],
      [1, 0, 1],
      [1, 0, 2],
    ],
  },
];

export const Default: Story = {
  args: {
    assets: mockAssets,
  },
};
