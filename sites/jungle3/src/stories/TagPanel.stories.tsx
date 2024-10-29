import { Meta, StoryObj } from "@storybook/react";
import { TagsPanel } from "@components/TagPanel";
import { Tag } from "@queries/tags/types";
import { useState } from "react";

const meta: Meta<typeof TagsPanel> = {
  title: "Components/TagsPanel",
  component: TagsPanel,
  argTypes: {
    selectedTag: { control: "text" },
    handleChangeTag: { action: "handleChangeTag" },
  },
};

export default meta;

type Story = StoryObj<typeof TagsPanel>;

const exampleTags: Tag[] = [
  { name: "Tag 1", tag_id: "tag1", owner_id: "", created: "" },
  { name: "Tag 2", tag_id: "tag2", owner_id: "", created: "" },
  { name: "Tag 3", tag_id: "tag3", owner_id: "", created: "" },
];

const InteractiveTemplate: Story["render"] = (args) => {
  const [selectedTag, setSelectedTag] = useState(args.selectedTag);

  const handleChangeTag = (value: string) => {
    setSelectedTag(value);
    args.handleChangeTag(value); // trigger Storybook action
  };

  return (
    <TagsPanel
      tags={args.tags}
      selectedTag={selectedTag}
      handleChangeTag={handleChangeTag}
    />
  );
};

export const Default: Story = {
  render: InteractiveTemplate,
  args: {
    tags: exampleTags,
    selectedTag: "All assets",
  },
};
