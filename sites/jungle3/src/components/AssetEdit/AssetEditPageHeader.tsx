import { useNavigate } from "react-router-dom";
import {
  FormControl,
  FormLabel,
  IconButton,
  Input,
  List,
  ListItemContent,
  ListItemDecorator,
  Stack,
  Typography,
} from "@mui/joy";
import {
  LucideChevronLeft,
  LucidePackage,
  LucideSquareArrowOutUpRight,
} from "lucide-react";
import { AssetIdentityHeader } from "@components/AssetIdentityHeader";
import { useAssetVersionStore } from "@store/assetVersionStore";
import { useTranslation } from "react-i18next";

export const AssetEditPageHeader = () => {
  const navigate = useNavigate();
  const { name, updateVersion, asset_id, version } = useAssetVersionStore();
  const { t } = useTranslation();

  return (
    <Stack gap="15px">
      <List orientation={"horizontal"}>
        <ListItemDecorator>
          <IconButton onClick={() => navigate("/packages")}>
            <LucideChevronLeft />
            <LucidePackage />
            &nbsp; {t("common.profileMenu.myPackages")}
          </IconButton>
        </ListItemDecorator>
        <ListItemContent>
          <Typography level="h4" component="h1">
            <b>{t("packageEdit.title")}</b>
          </Typography>
        </ListItemContent>
        <ListItemDecorator>
          <IconButton
            onClick={() => {
              navigate(
                `/package-view/${asset_id}/versions/${version.join(".")}`,
              );
            }}
          >
            {t("packageEdit.publicView")} &nbsp; <LucideSquareArrowOutUpRight />
          </IconButton>
        </ListItemDecorator>
      </List>
      <AssetIdentityHeader />
      <FormControl sx={{ mb: "5px" }}>
        <FormLabel>{t("common.name")}</FormLabel>
        <Input
          name="name"
          variant="outlined"
          placeholder="Package name..."
          value={name}
          onChange={(e) => updateVersion({ name: e.target.value })}
        />
      </FormControl>
    </Stack>
  );
};
