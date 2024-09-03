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
} from "@services/backendCommon";
import { useStatusStore } from "@store/statusStore";
import { PackageViewCard } from "@components/PackageViewCard";
import { LucideSearch } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { TopAssetsSlider } from "@components/TopAssetsCarousel/TopAssetsSlider";
import { useGetAllAssets } from "@queries/assets";
import { AssetTopResponse } from "types/apiTypes";

type SortType = "latest" | "oldest";

const Assets = () => {
  const { addError, addWarning } = useStatusStore();
  const [search, setSearch] = useState<string>("");
  const [sorting, setSorting] = useState<SortType>("latest");

  const {
    data: allAssets,
    isLoading: isAllAssetsLoading,
    error: allAssetsError,
  } = useGetAllAssets();
  const {
    data: topAssets,
    isLoading: isTopAssetsLoading,
    error: topAssetsError,
  } = useGetAllAssets();

  const handleError = (err: any) => {
    console.log("ERROR: ", err);
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  useEffect(() => {
    if (topAssetsError) {
      handleError(topAssetsError);
    }
    if (allAssetsError) {
      handleError(allAssetsError);
    }
  }, [topAssetsError, allAssetsError]);

  return (
    <>
      <Helmet>
        <title>Mythica • All packages</title>
      </Helmet>

      {isAllAssetsLoading || isTopAssetsLoading ? (
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
            <TopAssetsSlider assets={topAssets as AssetTopResponse[]} />
          </Stack>

          <Stack>
            <Typography level="h4" textAlign="start">
              All Packages
            </Typography>
            <Grid container spacing={2}>
              {allAssets &&
                allAssets
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
      )}
    </>
  );
};

export default Assets;
