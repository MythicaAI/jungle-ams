import type { Meta, StoryObj } from "@storybook/react";
import { DeleteButton } from "@components/common/DeleteButton";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof DeleteButton> = {
  title: "Components/DeleteButton",
  component: DeleteButton,
  parameters: {
    layout: "centered",
  },

  args: {
    onDeleteSuccess: action("Delete Success"),
  },
} satisfies Meta<typeof DeleteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    url: "/api/delete/item/1",
    name: "Item 1",
  },
};
