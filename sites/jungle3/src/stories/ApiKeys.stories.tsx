import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ApiKeys } from "@pages/ApiKeys";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "../queryClient.ts";

const meta: Meta<typeof ApiKeys> = {
  title: "Components/ApiKeysPage",
  component: ApiKeys,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <Story />
          </HelmetProvider>
        </QueryClientProvider>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ApiKeys>;

export const Default: Story = {};
