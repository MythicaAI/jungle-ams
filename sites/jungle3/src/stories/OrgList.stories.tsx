import { Meta, StoryObj } from "@storybook/react";
import { RolesList } from "../OrgsList";

const orgRoles = [
  {
    org_id: "1",
    org_name: "Mythica Inc.",
    role: "admin",
    profile_name: "",
    profile_id: "",
    created: "",
    author_id: "",
  },
  {
    org_id: "2",
    org_name: "Quantum Studios",
    role: "user",
    profile_name: "",
    profile_id: "",
    created: "",
    author_id: "",
  },
  {
    org_id: "3",
    org_name: "HDA Group",
    role: "admin",
    profile_name: "",
    profile_id: "",
    created: "",
    author_id: "",
  },
];

export default {
  title: "Components/OrgList",
  component: RolesList,
} satisfies Meta<typeof RolesList>;

type Story = StoryObj<typeof RolesList>;

export const Default: Story = {
  render: () => <RolesList orgRoles={orgRoles} />,
};
