import { Sheet } from "@mui/joy";
import { Outlet } from "react-router-dom";
import { AuthHeader } from "@components/AuthHeader";

export const Layout = () => {
  return (
    <Sheet sx={{ width: "100%", height: "100%" }}>
      <AuthHeader />
      <Outlet />
    </Sheet>
  );
};
