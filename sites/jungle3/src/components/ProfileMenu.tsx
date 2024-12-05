import React from "react";
import {
  Avatar,
  Divider,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";
import { LucideLogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NAV_LINKS } from "./constants";

interface ProfileMenuProps {
  name: string;
}

interface LinkMenuItemProps {
  to: string;
  handleNavigate: (to: string) => void;
  children: React.ReactNode;
  isActive?: boolean;
}

const MENU_TIMEOUT = 100;

const LinkMenuItem: React.FC<LinkMenuItemProps> = (props) => {
  return (
    <MenuItem
      sx={{
        textDecoration: "none",
        color: "inherit",
        "&:hover": {
          textDecoration: "none",
        },
      }}
      onClick={() => props.handleNavigate(props.to)}
      selected={props.isActive}
    >
      {props.children}
    </MenuItem>
  );
};

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ name }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  const handleOpenChange = React.useCallback(
    (_: React.SyntheticEvent | null, isOpen: boolean) => {
      setOpen(isOpen);
    },
    [],
  );

  const handleNavigate = (to: string) => {
    setOpen(false);
    setTimeout(() => {
      navigate(to);
    }, MENU_TIMEOUT);
  };

  return (
    <Dropdown open={open} onOpenChange={handleOpenChange}>
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
        {NAV_LINKS.map((navItem) => (
          <LinkMenuItem
            handleNavigate={handleNavigate}
            to={navItem.to}
            isActive={location.pathname === navItem.to}
          >
            {navItem.icon}
            {t(navItem.translation)}
          </LinkMenuItem>
        ))}
        <Divider orientation="horizontal" />
        <LinkMenuItem handleNavigate={handleNavigate} to="/logout">
          <LucideLogOut />
          {t("common.logout")}
        </LinkMenuItem>
      </Menu>
    </Dropdown>
  );
};
