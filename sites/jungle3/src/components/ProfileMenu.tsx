import React from "react";
import {
  Avatar,
  Divider,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";
import {
  LucideEdit,
  LucideGroup,
  LucideKeyRound,
  LucideLogOut,
  LucidePackage,
  LucideUpload,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

interface ProfileMenuProps {
  name: string;
}

interface LinkMenuItemProps {
  to: string;
  children: React.ReactNode;
}

const LinkMenuItem: React.FC<LinkMenuItemProps> = (props) => (
  <MenuItem
    component={RouterLink}
    to={props.to}
    sx={{
      textDecoration: "none",
      color: "inherit",
      "&:hover": {
        textDecoration: "none",
      },
    }}
  >
    {props.children}
  </MenuItem>
);

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ name }) => {
  return (
    <Dropdown>
      <MenuButton
        sx={{
          cursor: "pointer",
        }}
        id="profileMenuButton"
      >
        <Avatar variant="outlined" alt={name}></Avatar>
      </MenuButton>
      <Menu placement="bottom-end">
        <LinkMenuItem to={"/profile"}>
          <LucideEdit />
          Edit Profile
        </LinkMenuItem>
        <LinkMenuItem to={"/packages"}>
          <LucidePackage />
          My Packages
        </LinkMenuItem>
        <LinkMenuItem to={"/uploads"}>
          <LucideUpload />
          My Uploads
        </LinkMenuItem>
        <LinkMenuItem to={"/orgs"}>
          <LucideGroup />
          Manage Organizations
        </LinkMenuItem>
        <LinkMenuItem to={"/api-keys"}>
          <LucideKeyRound />
          API keys
        </LinkMenuItem>
        <Divider orientation="horizontal" />
        <LinkMenuItem to={"/logout"}>
          <LucideLogOut />
          Logout
        </LinkMenuItem>
      </Menu>
    </Dropdown>
  );
};
