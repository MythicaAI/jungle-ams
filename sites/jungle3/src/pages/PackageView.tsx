import { Box, CircularProgress, Grid } from "@mui/joy";
import {
  extractValidationErrors,
  translateError,
} from "@services/backendCommon";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStatusStore } from "@store/statusStore";
import PackageViewCarousel from "@components/PackageView/PackageViewCarousel";
import { PackageViewInfoPanel } from "@components/PackageView/PackageViewInfoPanel";
import { useGetAssetByVersion } from "@queries/packages";

interface PackageViewProps {
  asset_id?: string;
  version_id?: string;
}

export const PackageView = (props: PackageViewProps) => {
  const { addError, addWarning } = useStatusStore();

  const {
    data: assetVersion,
    isLoading,
    error,
  } = useGetAssetByVersion(props?.asset_id, props?.version_id);

  const handleError = (err: any) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error]);

  const header = assetVersion?.asset_id ? (
    <>
      <Grid direction={{ xs: "column", md: "row" }} container spacing={2}>
        <Grid xs={12} md={7}>
          <PackageViewCarousel {...assetVersion} />
        </Grid>
        <Grid xs={12} md={5}>
          <PackageViewInfoPanel {...assetVersion} />
        </Grid>
      </Grid>
    </>
  ) : (
    ""
  );
  const fileView = <Box>{header}</Box>;
  const filePending = <Box>Loading</Box>;

  if (isLoading) {
    return <CircularProgress />;
  }

  return <div>{assetVersion ? fileView : filePending}</div>;
};

export const PackageViewWrapper: React.FC = () => {
  const { asset_id, version_id } = useParams();
  return <PackageView asset_id={asset_id} version_id={version_id} />;
};

export default PackageViewWrapper;
