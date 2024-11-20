import { StatusStack } from "./StatusStack.tsx";
import { LucideBell } from "lucide-react";
import { Dropdown, Menu, MenuButton } from "@mui/joy";

export const StatusAlarm = () => {
  return (
    <Dropdown>
      <MenuButton
        id="notifications"
        sx={{
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          justifyContent: "center",
          height: "42px",
          width: "auto",
          padding: "0 12px",
        }}
      >
        <LucideBell size={20} />
      </MenuButton>

      <Menu placement="bottom-end">
        <StatusStack />
      </Menu>
    </Dropdown>
  );
};
