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
  LayoutDashboard,
  LucideEdit,
  LucideGroup,
  LucideKeyRound,
  LucideLogOut,
  LucidePackage,
  LucideUpload,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <Dropdown>
      <MenuButton
        sx={{
          cursor: "pointer",
          minWidth: "48px",
          height: "42px",
          padding: 0,
        }}
        id="profileMenuButton"
      >
        <Avatar
          variant="outlined"
          size="sm"
          alt={name}
          sx={{ width: "28px", height: "28px" }}
        />
      </MenuButton>
      <Menu placement="bottom-end">
        <LinkMenuItem to="/dashboard">
          <LayoutDashboard />
          {t("common.profileMenu.dashboard")}
        </LinkMenuItem>
        <LinkMenuItem to="/profile">
          <LucideEdit />
          {t("common.profileMenu.editProfile")}
        </LinkMenuItem>
        <LinkMenuItem to="/packages">
          <LucidePackage />
          {t("common.profileMenu.myPackages")}
        </LinkMenuItem>
        <LinkMenuItem to="/uploads">
          <LucideUpload />
          {t("common.profileMenu.myUploads")}
        </LinkMenuItem>
        <LinkMenuItem to="/orgs">
          <LucideGroup />
          {t("common.profileMenu.manageOrgs")}
        </LinkMenuItem>
        <LinkMenuItem to="/api-keys">
          <LucideKeyRound />
          {t("common.profileMenu.apiKeys")}
        </LinkMenuItem>
        <Divider orientation="horizontal" />
        <LinkMenuItem to="/logout">
          <LucideLogOut />
          {t("common.logout")}
        </LinkMenuItem>
      </Menu>
    </Dropdown>
  );
};
