import type { Meta, StoryObj } from "@storybook/react";
import { DownloadButton } from "../components/common/DownloadButton";
import { LucideDownload } from "lucide-react";
import {queryClient} from "../queryClient.ts";
import {QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter} from "react-router-dom";
import {Box} from "@mui/joy";

const meta: Meta<typeof DownloadButton> = {
  title: "Components/DownloadButton",
  component: DownloadButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  args: {
    icon: <LucideDownload />,
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Box sx={{ width: "100%", maxWidth: "1200px", margin: "auto" }}>
            <Story />
          </Box>
        </BrowserRouter>
      </QueryClientProvider>
    )
  ]
} satisfies Meta<typeof DownloadButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    file_id: "1",
  },
};

export const WithDifferentIcon: Story = {
  args: {
    file_id: "2",
    icon: <LucideDownload color="red" />, // Example with a different icon or styled icon
  },
};
