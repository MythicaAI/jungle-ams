import React, { useCallback, useState } from "react";
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
import JobResultCard from "@components/JobResultCard";
import { LucideChevronLeft } from "lucide-react";
import { dictionary, hou, ParmGroup } from "houdini-ui";
import { useSceneStore } from "@store/sceneStore";
import BabylonScenePage from "./BabylonScenePage";

const TabStyle = { ":focus": { outline: "none" } };
const TabPanelStyle = { padding: "12px 0 0" };


export const PackageJobs = () => {
  const { asset_id, version_id } = useParams();
  const { data: jobDefinitions, isLoading: isJobDefinitionsLoading } =
    useGetJobDefinition(asset_id as string, (version_id as string)?.split("."));
  const { data: assetData, isLoading: isAssetLoading } = useGetAssetByVersion(
    asset_id,
    version_id,
  );

  const parmTemplateGroup = new hou.ParmTemplateGroup(jobDefinitions?.[0]?.params_schema.params_v2 as dictionary[]);
  const [inputData, setInputData] = useState<dictionary>({});
  const [selectedHdaId, setSelectedHdaId] = React.useState<null | string>(null);
  const { hdaSchemas } = useSceneStore();

  const matchesHdaSchema = hdaSchemas.find(
    (schema) => schema.name === assetData?.name,
  );

  const hdaFiles = assetData?.contents?.files.filter((file) =>
    file.file_name.includes(".hda"),
  );

  const selectedJobData = jobDefinitions?.find(
    (definition) => definition.source.file_id === selectedHdaId,
  );

  const handleParmChange = useCallback(
    (formData: dictionary) => {
      setInputData((prev) => ({ ...prev, ...formData }));
    },
    [setInputData],
  );

  /*
  const { addError, addWarning } = useStatusStore();

  const selectedHdaData = hdaFiles?.find(
    (hda) => hda.file_id === selectedHdaId,
  );
  const {
    data: autoResp,
    isLoading: isAutomationLoading,
    error: automationError,
  } = useRunAutomation(
    {
      correlation: v4(),
      channel: "houdini",
      path: "/mythica/hda",
      file_id: selectedHdaData?.file_id,
      asset_id,
      auth_token: cookies.get("auth_token"),
      data: { hdas: [selectedHdaData] },
    },
    !!selectedHdaData,
  );
  */
  const { mutate: runJob } = useRunJob(
    asset_id as string,
    version_id as string,
  );
  const navigate = useNavigate();

  /*
  const hdaInterface = autoResp as HDAInterfaceResponse;
  useEffect(() => {
    if (hdaInterface && selectedHdaId) {
      const strPt = hdaInterface.result?.node_types?.[0].code || "";
      const getParmTemplateGroup = eval(strPt);
      const ptg = getParmTemplateGroup(hou) as hou.ParmTemplateGroup;
      setParmTemplateGroup(ptg);
      ptg.draw();
    }
  }, [selectedHdaId, hdaInterface]);
  const handleError = (err: any) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  useEffect(() => {
    if (automationError) {
      handleError(automationError);
    }
  }, [automationError]);
  */

  const { data: jobResultsHistory, isLoading: isJobResultsLoading } =
    useGetJobsDetailsByAsset(
      asset_id as string,
      version_id?.split(".") as string[],
    );

  React.useEffect(() => {
    if (!selectedHdaId && hdaFiles && hdaFiles.length > 0) {
      setSelectedHdaId(hdaFiles[0].file_id);
    }
  }, [hdaFiles]);

  const onSubmit = (formData: dictionary) => {
    runJob({
      job_def_id: jobDefinitions?.find(
        (definition) => definition.source.file_id === selectedHdaId,
      )?.job_def_id as string,
      params: { ...formData, hda_file: selectedHdaId },
    });
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
        {matchesHdaSchema ? (
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
                3D Live Preview
              </Tab>
            </TabList>
            <TabPanel value={0}>
              <BabylonScenePage schemaName={assetData?.name} />
            </TabPanel>
          </Tabs>
        ) : (
          <Typography level="h4" textAlign="start" mt="24px">
            No automation definitions found for this package.
          </Typography>
        )}
      </Stack>
    );
  }

  if (!selectedHdaId) return null;

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
          {matchesHdaSchema && (
            <Tab sx={TabStyle} disableIndicator>
              3D Live Preview
            </Tab>
          )}
          <Tab sx={TabStyle} disableIndicator>
            Automation history
          </Tab>
        </TabList>

        <TabPanel value={0} sx={TabPanelStyle}>
          <Stack
            alignItems="flex-start"
            sx={{
              [`& .parm-group`]: {
                width: "550px",
                'input:not([type="checkbox"])': {
                  width: "100%",
                  boxSizing: "border-box",
                },
                label: {
                  textAlign: "left",
                },
              },
              ["& .field"]: {
                width: "100%",
              },
            }}
          >
            <Stack direction="row" gap="12px" alignItems="center" mb="24px">
              {hdaFiles && hdaFiles?.length > 1 ? (
                <Select
                  variant="soft"
                  name="org_id"
                  placeholder={""}
                  value={selectedHdaId}
                  multiple={false}
                  onChange={(_, newValue) => {
                    setSelectedHdaId(newValue);
                  }}
                >
                  {hdaFiles.map((hda) => (
                    <Option key={hda.file_id} value={hda.file_id}>
                      {
                        jobDefinitions?.find(
                          (definition) =>
                            definition.source.file_id === hda.file_id,
                        )?.name
                      }
                    </Option>
                  ))}
                </Select>
              ) : (
                <Typography level="h3">{selectedJobData?.name}</Typography>
              )}
              <Divider orientation="vertical" />
              <Typography level="h3">{selectedJobData?.description}</Typography>
            </Stack>
            <Typography fontSize={20} level="h3" mb="12px">
              Params
            </Typography>
              <ParmGroup
                data={inputData}
                group={parmTemplateGroup as hou.ParmTemplateGroup}
                onChange={handleParmChange}
              />
            <Button
              sx={{ width: "fit-content", mt: "12px", bgcolor: "#367c64" }}
              onClick={() => onSubmit(inputData)}
            >
              Run automation
            </Button>
          </Stack>
        </TabPanel>

        {matchesHdaSchema && (
          <TabPanel value={1}>
            <BabylonScenePage schemaName={assetData?.name} />
          </TabPanel>
        )}

        <TabPanel value={matchesHdaSchema ? 2 : 1} sx={TabPanelStyle}>
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
