import {
  Box,
  CircularProgress,
  Grid,
  Input,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import {
  extractValidationErrors,
  translateError,
} from "./services/backendCommon.ts";
import {AssetTopResponse} from "./types/apiTypes.ts";
import { useGlobalStore } from "./stores/globalStore.ts";
import { useStatusStore } from "./stores/statusStore.ts";
import { AxiosError } from "axios";
import { api } from "./services/api";
import { PackageViewCard } from "./components/PackageViewCard";
import { LucideSearch } from "lucide-react";
import { TopAssetsSlider } from "./components/TopAssetsCarousel/TopAssetsSlider.tsx";

type SortType = "latest" | "oldest";

const Assets = () => {
  const { authToken } = useGlobalStore();
  const { addError, addWarning } = useStatusStore();
  const [search, setSearch] = useState<string>("");
  const [sorting, setSorting] = useState<SortType>("latest");
  const [isAllAssetsLoading, setIsAllAssetsLoading] = useState(true);
  const [isTopAssetsLoading, setIsTopAssetsLoading] = useState(true);

  const [topAssets, setTopAssets] = useState<AssetVersionResponse[]>([]);
  const [allAssets, setAllAssets] = useState<AssetTopResponse[]>([]);

  const handleError = (err: AxiosError) => {
    console.log("ERROR: ", err);
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  useEffect(() => {
    setIsAllAssetsLoading(true);
    setIsTopAssetsLoading(true);

    api
      .get<AssetTopResponse[]>({ path: "/assets/top", withAuth: false })
      .then((r) => {
        setTopAssets(r);
        setIsTopAssetsLoading(false);
      })
      .catch((err) => handleError(err));

    api
      .get<AssetVersionResponse[]>({ path: "/assets/all", withAuth: false })
      .then((r) => {
        setAllAssets(r);
        setIsAllAssetsLoading(false);
      })
      .catch((err) => handleError(err));
  }, [authToken]);

  return isAllAssetsLoading || isTopAssetsLoading ? (
    <CircularProgress />
  ) : (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Stack direction="row" gap="10px" mb="15px">
        <Input
          startDecorator={<LucideSearch width="16px" />}
          placeholder="Package name filter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "90%" }}
        />
        <Select
          value={sorting}
          onChange={(_, value) => setSorting(value as SortType)}
          sx={{
            minWidth: "110px",
            width: "10%",
            height: "34px",
            "& button": { outline: "none" },
          }}
        >
          <Option value="latest">Latest</Option>
          <Option value="oldest">Oldest</Option>
        </Select>
      </Stack>

      <Stack mb="15px">
        <Typography level="h4" textAlign="start">
          Top Packages
        </Typography>
        <TopAssetsSlider assets={topAssets} />
      </Stack>

      <Stack>
        <Typography level="h4" textAlign="start">
          All Packages
        </Typography>
        <Grid container spacing={2}>
          {allAssets
            .filter((version) =>
              version.name.toLowerCase().includes(search.toLowerCase()),
            )
            .sort((a, b) => {
              const aDate = new Date(a.created).getTime();
              const bDate = new Date(b.created).getTime();

              return sorting === "oldest" ? aDate - bDate : bDate - aDate;
            })
            .map((av) => (
              <Grid
                xs={12}
                sm={6}
                md={4}
                key={av.asset_id + "_" + av.version.join(".")}
              >
                <PackageViewCard av={av} />
              </Grid>
            ))}
        </Grid>
      </Stack>
    </Box>
  );
};

export default Assets;
