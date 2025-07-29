import { Meta, StoryObj } from "@storybook/react";
import Uploads from "../pages/Uploads";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import {queryClient} from "../queryClient.ts";
import {QueryClientProvider} from "@tanstack/react-query";

export default {
  title: "Components/Uploads",
  component: Uploads,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof Uploads>;

type Story = StoryObj<typeof Uploads>;

export const Default: Story = {
  render: () => {
    return <Uploads />;
  },
};
