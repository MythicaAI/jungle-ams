import { DashboardCard } from "@components/DashboardCard";
import { Card, CircularProgress, Stack, Typography, Grid } from "@mui/joy";
import { useGetOwnedPackages } from "@queries/packages";
import { useGetPendingUploads } from "@queries/uploads";
import { useGlobalStore } from "@store/globalStore";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { profile } = useGlobalStore();
  const currentDate = format(new Date(), "eeee, d MMMM");
  const { data: packages, isLoading: isPackagesLoading } =
    useGetOwnedPackages();
  const { orgRoles } = useGlobalStore();
  const { data: uploads, isLoading: isUploadsLoading } = useGetPendingUploads();
  const { t } = useTranslation();

  if (!profile || isPackagesLoading || isUploadsLoading)
    return <CircularProgress />;

  return (
    <div>
      <Card sx={{ mb: "20px" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          p="12px"
        >
          <Typography level="h2">
            {t("common.welcome")} {profile.name}
          </Typography>
          <Typography>{currentDate}</Typography>
        </Stack>
      </Card>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid md={4} xs={6}>
          <DashboardCard
            title={t("common.profileMenu.myPackages")}
            textContent={packages?.length ?? "0"}
            url="/packages"
          />
        </Grid>
        <Grid md={4} xs={6}>
          <DashboardCard
            title={t("common.profileMenu.myOrgs")}
            textContent={orgRoles?.length ?? "0"}
            url="/orgs"
          />
        </Grid>
        <Grid md={4} xs={6}>
          <DashboardCard
            title={t("common.profileMenu.myUploads")}
            textContent={uploads?.length ?? "0"}
            url="/uploads"
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
