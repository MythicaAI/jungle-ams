import { Meta, StoryObj } from "@storybook/react";
import { UploadsReadyList } from "@components/Uploads/UploadsReadyList";
import { useUploadStore } from "@store/uploadStore";
import { Box } from "@mui/joy";

// Define the metadata for the component
const meta: Meta<typeof UploadsReadyList> = {
  title: "Components/UploadsReadyList",
  component: UploadsReadyList,
  args: {
    category: "files",
    fileTypeFilters: [".hda", ".png"],
    isDrawerOpen: true,
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof UploadsReadyList>;

export const Default: Story = {
  decorators: [
    (Story) => {
      useUploadStore.setState({
        uploads: {
          //@ts-expect-error
          file1: { file_id: "file1", file_name: "example.hda" },
          //@ts-expect-error
          file2: { file_id: "file2", file_name: "demo.png" },
        },
      });

      return (
        <Box width="600px">
          <Story />
        </Box>
      );
    },
  ],
};
