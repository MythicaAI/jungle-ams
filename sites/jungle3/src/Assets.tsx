import {Box, Card, CardContent, CardCover, Grid, Typography} from '@mui/joy';
import {useEffect, useState} from "react";
import {extractValidationErrors, getData, translateError} from "./services/backendCommon.ts";
import {AssetVersionResponse} from "./types/apiTypes.ts";
import {useGlobalStore} from "./stores/globalStore.ts";
import {useStatusStore} from "./stores/statusStore.ts";
import {AxiosError} from "axios";
import {getThumbnailImg} from "./lib/packagedAssets.tsx";
import {DownloadButton} from "./components/DownloadButton";
import {LucidePackage} from "lucide-react";

const Assets = () => {
  const { authToken } = useGlobalStore();
  const { addError, addWarning } = useStatusStore();

  const [versions, setVersions] = useState<AssetVersionResponse[]>([]);

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  useEffect(() => {
    getData<AssetVersionResponse[]>('assets/top')
      .then((r) => setVersions(r))
      .catch((err) => handleError(err));
  }, [authToken]);

  return (
    <Box sx={{flexGrow: 1, padding: 2}}>
      <Grid container spacing={2}>
          {versions.map(av => (
            <Grid xs={4}>
              <Card>
                <CardCover>
                  <img
                    height="200"
                    src={getThumbnailImg(av)}
                    loading={"lazy"}
                    alt={av.name}/>
                </CardCover>
                <CardContent>
                  <Typography
                    level="body-lg"
                    fontWeight="lg"
                  mt={{ xs: 12, sm: 18 }}>
                    {av.name}
                    <DownloadButton file_id={av.package_id} icon={<LucidePackage/>}/>
                  </Typography>

                </CardContent>
              </Card>
            </Grid>))}
      </Grid>
    </Box>
  );
};

export default Assets;
