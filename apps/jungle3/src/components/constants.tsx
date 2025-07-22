import {
  LayoutDashboard,
  LucideEdit,
  LucideGroup,
  LucideKeyRound,
  LucidePackage,
  LucideUpload,
} from "lucide-react";

export const NAV_LINKS = [
  {
    to: "/dashboard",
    translation: "common.profileMenu.dashboard",
    icon: <LayoutDashboard />,
  },
  {
    to: "/profile",
    translation: "common.profileMenu.editProfile",
    icon: <LucideEdit />,
  },
  {
    to: "/packages",
    translation: "common.profileMenu.myPackages",
    icon: <LucidePackage />,
  },
  {
    to: "/uploads",
    translation: "common.profileMenu.myUploads",
    icon: <LucideUpload />,
  },
  {
    to: "/orgs",
    translation: "common.profileMenu.manageOrgs",
    icon: <LucideGroup />,
  },
  {
    to: "/api-keys",
    translation: "common.profileMenu.apiKeys",
    icon: <LucideKeyRound />,
  },
];
