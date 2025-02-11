import { Meta, StoryObj } from "@storybook/react";
import { TagCard } from "@components/TagCard";
import { Tag } from "@queries/tags/types";

const meta: Meta<typeof TagCard> = {
  title: "Components/TagCard",
  component: TagCard,
  argTypes: {
    selectedTag: { control: "text" },
    tag: {
      control: "object",
      description: "Tag object containing name",
    },
  },
};

export default meta;

type Story = StoryObj<typeof TagCard>;

const exampleTag: Tag = {
  name: "Example Tag",
  tag_id: "",
  owner_id: "",
  created: "",
  contents: null,
  page_priority: null,
};

export const Default: Story = {
  args: {
    tag: exampleTag,
    selectedTag: "",
  },
};

export const Selected: Story = {
  args: {
    tag: exampleTag,
    selectedTag: "Example Tag",
  },
};
