import React from 'react';
import { Avatar, Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy';
import {LucideEdit, LucideGroup, LucidePackage, LucideUpload} from "lucide-react";
import {Link as RouterLink} from "react-router-dom";

interface ProfileMenuProps {
    name: string
}

const LinkMenuItem = React.forwardRef((props, ref) => (
  <MenuItem
    {...props}
    ref={ref}
    component={RouterLink}
    sx={{
      textDecoration: 'none',
      color: 'inherit',
      '&:hover': {
        textDecoration: 'none',
      },
    }}
  />
));

export const ProfileMenu: React.FC<ProfileMenuProps> = ({name}) => {
  return (
      <Dropdown>
          <MenuButton
              sx={{
                  cursor: 'pointer',
              }}

          >
              <Avatar variant="outlined" alt={name}></Avatar>
          </MenuButton>
          <Menu placement="bottom-end">
              <LinkMenuItem to={"/profile"}>
                  <LucideEdit/>
                  Edit Profile
              </LinkMenuItem>
              <LinkMenuItem to={"/packages"}>
                  <LucidePackage/>
                  My Packages
              </LinkMenuItem>
              <LinkMenuItem to={"/uploads"}>
                  <LucideUpload/>
                  My Uploads
              </LinkMenuItem>
              <LinkMenuItem to={"/orgs"}>
                  <LucideGroup/>
                  Manage Organizations
              </LinkMenuItem>
          </Menu>
      </Dropdown>
  );
}