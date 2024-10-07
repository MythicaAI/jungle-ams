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

export const AssetEditPageHeader = () => {
  const navigate = useNavigate();
  const { name, updateVersion } = useAssetVersionStore();

  return (
    <Stack gap="15px">
      <List orientation={"horizontal"}>
        <ListItemDecorator>
          <IconButton onClick={() => navigate("/packages")}>
            <LucideChevronLeft />
            <LucidePackage />
            &nbsp; My Packages
          </IconButton>
        </ListItemDecorator>
        <ListItemContent>
          <Typography level="h4" component="h1">
            <b>Package Editor</b>
          </Typography>
        </ListItemContent>
      </List>
      <AssetIdentityHeader />
      <FormControl sx={{ mb: "5px" }}>
        <FormLabel>Name</FormLabel>
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
