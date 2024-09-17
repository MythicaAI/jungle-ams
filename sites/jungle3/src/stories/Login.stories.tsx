import { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";

export default {
  title: "Components/Login",
  component: Login,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Login>;

type Story = StoryObj<typeof Login>;

export const Default: Story = {
  render: () => <Login />,
};
