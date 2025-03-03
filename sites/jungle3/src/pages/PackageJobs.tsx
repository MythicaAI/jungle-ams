import React from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Divider,
  Option,
  Select,
  Stack,
  Tab,
  tabClasses,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import {
  useGetJobDefinition,
  useGetJobsDetailsByAsset,
  useGetAssetByVersion,
  useRunJob,
} from "@queries/packages";
import { useNavigate, useParams } from "react-router-dom";
import { FormContainer } from "@components/common/FormContainer";
import { AutomationParamsForm } from "@components/AutomationParamsForm";
import JobResultCard from "@components/JobResultCard";
import { LucideChevronLeft } from "lucide-react";
import { useStatusStore } from "@store/statusStore";

const TabStyle = { ":focus": { outline: "none" } };
const TabPanelStyle = { padding: "12px 0 0" };

export const PackageJobs = () => {
  const { asset_id, version_id } = useParams();
  const { setSuccess } = useStatusStore();
  const { data: jobDefinitions, isLoading: isJobDefinitionsLoading } =
    useGetJobDefinition(asset_id as string, (version_id as string)?.split("."));
  const { data: assetData, isLoading: isAssetLoading } = useGetAssetByVersion(
    asset_id,
    version_id,
  );
  const { mutate: runJob } = useRunJob(
    asset_id as string,
    version_id as string,
  );
  const [selectedJobId, setSelectedJobId] = React.useState<null | string>(null);
  const [formReloading, setFormReloading] = React.useState(false);
  const navigate = useNavigate();

  const { data: jobResultsHistory, isLoading: isJobResultsLoading } =
    useGetJobsDetailsByAsset(
      asset_id as string,
      version_id?.split(".") as string[],
    );

  const selectedJobData = jobDefinitions?.find(
    (job) => job.job_def_id === selectedJobId,
  );

  React.useEffect(() => {
    if (jobDefinitions && jobDefinitions.length > 0) {
      setSelectedJobId(jobDefinitions[0].job_def_id);
    }
  }, [jobDefinitions]);

  const onSubmit = (formData: { [key: string]: string | boolean | number }) => {
    console.log("formData: ", formData);
    runJob({ job_def_id: selectedJobId as string, params: { ...formData } });
    setSuccess("Automation created");
  };

  if (isAssetLoading || isJobDefinitionsLoading || isJobResultsLoading)
    return <CircularProgress />;

  if (jobDefinitions && jobDefinitions?.length === 0) {
    return (
      <Stack padding="0 16px">
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          mb="12px"
        >
          <Stack direction="row" alignItems="center" gap="12px">
            <Typography level="h2">{assetData?.name}</Typography>
            <Chip
              key={assetData?.version.join(".")}
              variant="soft"
              color="primary"
              size="lg"
              sx={{ borderRadius: "xl" }}
            >
              {assetData?.version.join(".")}
            </Chip>
          </Stack>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<LucideChevronLeft height="20px" width="20px" />}
            sx={{ pl: "10px" }}
            onClick={() => {
              navigate(`/package-view/${asset_id}/versions/${version_id}`);
            }}
          >
            Back to Package view
          </Button>
        </Stack>
        <Typography level="h4" textAlign="start" mt="24px">
          No automation definitions found for this package.
        </Typography>
      </Stack>
    );
  }

  if (!selectedJobId) return null;

  return (
    <Stack alignItems="start" padding="0 16px">
      <Stack
        direction="row"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        mb="12px"
      >
        <Stack direction="row" alignItems="center" gap="12px">
          <Typography level="h2">{assetData?.name}</Typography>
          <Chip
            key={assetData?.version.join(".")}
            variant="soft"
            color="primary"
            size="lg"
            sx={{ borderRadius: "xl" }}
          >
            {assetData?.version.join(".")}
          </Chip>
        </Stack>
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<LucideChevronLeft height="20px" width="20px" />}
          sx={{ pl: "10px" }}
          onClick={() => {
            navigate(`/package-view/${asset_id}/versions/${version_id}`);
          }}
        >
          Back to Package view
        </Button>
      </Stack>
      <Tabs
        aria-label="tabs"
        defaultValue={0}
        sx={{ width: "100%", bgcolor: "transparent" }}
      >
        <TabList
          disableUnderline
          sx={{
            p: 0.5,
            gap: 0.5,
            borderRadius: "8px",
            bgcolor: "background.level1",
            [`& .${tabClasses.root}[aria-selected="true"]`]: {
              boxShadow: "sm",
              bgcolor: "background.surface",
            },
          }}
        >
          <Tab sx={TabStyle} disableIndicator>
            Run automation
          </Tab>
          <Tab sx={TabStyle} disableIndicator>
            Automation history
          </Tab>
        </TabList>

        <TabPanel value={0} sx={TabPanelStyle}>
          <Stack alignItems="flex-start">
            <Stack direction="row" gap="12px" alignItems="center" mb="24px">
              {jobDefinitions && jobDefinitions?.length > 1 ? (
                <Select
                  variant="soft"
                  name="org_id"
                  placeholder={""}
                  value={selectedJobId}
                  multiple={false}
                  onChange={(_, newValue) => {
                    setSelectedJobId(newValue);
                    setFormReloading(true);
                    setTimeout(() => {
                      setFormReloading(false);
                    }, 500);
                  }}
                >
                  {jobDefinitions.map((job) => (
                    <Option key={job.job_def_id} value={job.job_def_id}>
                      {job.name}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Typography level="h3">{selectedJobData?.name}</Typography>
              )}
              <Divider orientation="vertical" />
              <Typography level="h3">{selectedJobData?.job_type}</Typography>
            </Stack>
            <Typography fontSize={20} level="h3" mb="12px">
              Params
            </Typography>
            <FormContainer<{ bebra?: string }>
              {...{ onSubmit }}
              id="addSourceForm"
            >
              {() => (
                <Stack gap="12px" width="100%" maxWidth="550px">
                  {formReloading ? (
                    <CircularProgress />
                  ) : (
                    <AutomationParamsForm
                      params={selectedJobData?.params_schema.params}
                    />
                  )}

                  <Button
                    sx={{ width: "fit-content", mt: "12px" }}
                    type="submit"
                  >
                    Run automation
                  </Button>
                </Stack>
              )}
            </FormContainer>
          </Stack>
        </TabPanel>

        <TabPanel value={1} sx={TabPanelStyle}>
          {jobResultsHistory && jobResultsHistory.length > 0 ? (
            <Stack gap="12px">
              {jobResultsHistory
                ?.sort((a, b) => b.created.localeCompare(a.created))
                ?.map((result) => {
                  return <JobResultCard key={result.job_id} {...result} />;
                })}
            </Stack>
          ) : (
            <Stack padding="0 0 12px" justifyContent="start" alignItems="start">
              <Typography level="h3">Automation history missing</Typography>
            </Stack>
          )}
        </TabPanel>
      </Tabs>
    </Stack>
  );
};
