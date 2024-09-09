import { Meta, StoryObj } from "@storybook/react";
import { AuthHeader } from "@components/AuthHeader";
import { MemoryRouter } from "react-router-dom";
import { useGlobalStore } from "@store/globalStore";

const useMockStore = (
  stateOverrides: Partial<ReturnType<typeof useGlobalStore>>,
) => {
  const store = useGlobalStore.getState();
  useGlobalStore.setState({ ...store, ...stateOverrides });
};

export default {
  title: "Components/AuthHeader",
  component: AuthHeader,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof AuthHeader>;

type Story = StoryObj<typeof AuthHeader>;

export const LoggedIn: Story = {
  render: () => {
    useMockStore({
      authToken: "mockAuthToken",
      profile: {
        name: "John Doe",
      },
    });
    return <AuthHeader />;
  },
};

export const LoggedOut: Story = {
  render: () => {
    useMockStore({
      authToken: "",
      profile: null,
    });
    return <AuthHeader />;
  },
};
