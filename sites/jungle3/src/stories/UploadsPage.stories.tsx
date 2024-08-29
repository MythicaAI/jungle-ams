import { Meta, StoryObj } from "@storybook/react";
import Uploads from "../pages/Uploads";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

export default {
  title: "Components/Uploads",
  component: Uploads,
  decorators: [
    (Story) => (
      <HelmetProvider>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </HelmetProvider>
    ),
  ],
} satisfies Meta<typeof Uploads>;

type Story = StoryObj<typeof Uploads>;

export const Default: Story = {
  render: () => {
    return <Uploads />;
  },
};
