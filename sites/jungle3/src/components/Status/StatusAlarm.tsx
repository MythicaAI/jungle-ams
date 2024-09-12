import { StatusStack } from "./StatusStack.tsx";
import { LucideBell } from "lucide-react";
import { Dropdown, Menu, MenuButton } from "@mui/joy";

export const StatusAlarm = () => {
  return (
    <Dropdown>
      <MenuButton sx={{ display: { xs: "none", sm: "block" } }}>
        <LucideBell />
      </MenuButton>
      <Menu placement="bottom-end">
        <StatusStack />
      </Menu>
      {/* */}
    </Dropdown>
  );
};
