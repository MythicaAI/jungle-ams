import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ApiKeys } from "@pages/ApiKeys";

const meta: Meta<typeof ApiKeys> = {
  title: "Components/ApiKeysPage",
  component: ApiKeys,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <HelmetProvider>
          <Story />
        </HelmetProvider>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ApiKeys>;

export const Default: Story = {};
