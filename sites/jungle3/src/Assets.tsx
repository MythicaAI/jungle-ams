import {
  Box,
  Grid,
} from "@mui/joy";
import { useEffect, useState } from "react";
import {
  extractValidationErrors,
  translateError,
} from "./services/backendCommon.ts";
import { AssetVersionResponse } from "./types/apiTypes.ts";
import { useGlobalStore } from "./stores/globalStore.ts";
import { useStatusStore } from "./stores/statusStore.ts";
import { AxiosError } from "axios";
import { api } from "./services/api";
import {PackageViewCard} from "./components/PackageViewCard";

const Assets = () => {
  const { authToken } = useGlobalStore();
  const { addError, addWarning } = useStatusStore();

  const [versions, setVersions] = useState<AssetVersionResponse[]>([]);

  const handleError = (err: AxiosError) => {
    console.log("ERROR: ", err);
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  useEffect(() => {
    api
      .get<AssetVersionResponse[]>({ path: "/assets/top", withAuth: false })
      .then((r) => setVersions(r))
      .catch((err) => handleError(err));
  }, [authToken]);

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Grid container spacing={2}>
        {versions.map((av) => (
          <Grid xs={4} key={av.asset_id + "_" + av.version.join('.')}>
            <PackageViewCard {...av} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Assets;
