import { Meta, StoryObj } from '@storybook/react';
import { FileProgress } from '../components/FileProgress';

const meta: Meta<typeof FileProgress> = {
  title: 'Components/FileProgress',
  component: FileProgress,
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Progress value',
      defaultValue: 50,
    },
    size: {
      control: { type: 'select', options: ['sm', 'md', 'lg'] },
      description: 'Size of the progress circle',
      defaultValue: 'sm',
    },
  },
};

export default meta;

type Story = StoryObj<typeof FileProgress>;

export const Default: Story = {
  args: {
    value: 50,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    value: 60,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    value: 80,
    size: 'lg',
  },
};
