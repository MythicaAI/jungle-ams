import {Box, Grid} from "@mui/joy";
import {AssetVersionResponse} from "./types/apiTypes.ts";
import {
  extractValidationErrors,
  translateError,
} from "./services/backendCommon.ts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AxiosError } from "axios";
import { useStatusStore } from "./stores/statusStore.ts";
import { api } from "./services/api";
import PackageViewCarousel from "./components/PackageViewCarousel.tsx";
import {PackageViewInfoPanel} from "./components/PackageViewInfoPanel.tsx";

interface PackageViewProps {
  asset_id?: string;
  version_id?: string
}

export const PackageView = (props: PackageViewProps) => {
  const { addError, addWarning } = useStatusStore();
  const [assetVersion, setAssetVersion] = useState({} as unknown as AssetVersionResponse);

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  useEffect(() => {
    if (!props.asset_id) {
      return;
    }

    api
      .get<AssetVersionResponse>({ path: `/assets/${props.asset_id}/versions/${props.version_id}` })
      .then((r) => {
        setAssetVersion(r as AssetVersionResponse);
      })
      .catch((err) => handleError(err));
  }, [props.asset_id, props.version_id]);

  const header = assetVersion ? (
    <Grid container spacing={2}>
      <Grid xs={7}>
        <PackageViewCarousel {...assetVersion} /></Grid>
      <Grid xs={5}>
        <PackageViewInfoPanel {...assetVersion} />
      </Grid>
    </Grid>
  ) : (
    ""
  );
  const fileView = <Box>{header}</Box>;
  const filePending = <Box>Loading</Box>;

  return <div>{assetVersion ? fileView : filePending}</div>;
};

export const PackageViewWrapper: React.FC = () => {
  const { asset_id, version_id } = useParams();
  return <PackageView asset_id={asset_id} version_id={version_id} />;
};
