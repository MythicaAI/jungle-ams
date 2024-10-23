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
import { LucideChevronLeft, LucidePackage } from "lucide-react";
import { AssetIdentityHeader } from "@components/AssetIdentityHeader";
import { useAssetVersionStore } from "@store/assetVersionStore";
import { useTranslation } from "react-i18next";

export const AssetEditPageHeader = () => {
  const navigate = useNavigate();
  const { name, updateVersion } = useAssetVersionStore();
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
