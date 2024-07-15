import type { Meta, StoryObj } from '@storybook/react';
import { DownloadButton } from '../components/DownloadButton';
import { LucideDownload } from 'lucide-react';

const meta: Meta<typeof DownloadButton> = {
  title: 'Components/DownloadButton',
  component: DownloadButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    icon: <LucideDownload />,
  },
} satisfies Meta<typeof DownloadButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    file_id: '1',
  },
};

export const WithDifferentIcon: Story = {
  args: {
    file_id: '2',
    icon: <LucideDownload color="red" />, // Example with a different icon or styled icon
  },
};
