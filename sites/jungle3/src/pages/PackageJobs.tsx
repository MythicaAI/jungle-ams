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
import { JobDetails } from "@queries/packages/types";
import SceneViewerFile from "@components/BabylonViewer/SceneViewerFile";
import { useGetFile } from "@queries/files";
import { useWindowSize } from "@hooks/useWindowSize";

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
  const { currentWidth } = useWindowSize();
  const mobileSize = currentWidth < 700;

  const parmTemplateGroup = React.useMemo(
    () =>
      new hou.ParmTemplateGroup(
        jobDefinitions?.[0]?.params_schema.params_v2 as dictionary[],
      ),
    [jobDefinitions],
  );

  const inputFileParms = parmTemplateGroup.parm_templates.filter(
    (parm) =>
      parm.param_type === hou.parmTemplateType.File &&
      parm.name.startsWith("input"),
  );

  const [inputData, setInputData] = useState<dictionary>({});
  const [selectedHdaId, setSelectedHdaId] = React.useState<null | string>(null);
  const { hdaSchemas } = useSceneStore();

  const matchesHdaSchema = hdaSchemas.find(
    (schema) => schema.name === assetData?.name,
  );

  const hdaFiles = assetData?.contents?.files.filter((file) =>
    file.file_name.includes(".hda"),
  );

  const inputFiles =
    assetData?.contents?.files.filter(
      (file) =>
        file.file_name.endsWith(".usd") ||
        file.file_name.endsWith(".usz") ||
        file.file_name.includes(".glb") ||
        file.file_name.includes(".gltf") ||
        file.file_name.includes(".fbx") ||
        file.file_name.includes(".obj"),
    ) || [];

  const selectedJobData = jobDefinitions?.find(
    (definition) => definition.source.file_id === selectedHdaId,
  );

  const handleParmChange = useCallback(
    (formData: dictionary) => {
      setInputData((prev) => ({ ...prev, ...formData }));
    },
    [setInputData],
  );

  const { mutate: runJob } = useRunJob(
    asset_id as string,
    version_id as string,
  );
  const navigate = useNavigate();

  const { data: jobResultsHistory, isLoading: isJobResultsLoading } =
    useGetJobsDetailsByAsset(
      asset_id as string,
      version_id?.split(".") as string[],
    );

  const [executedRun, setExecutedRun] = useState<boolean>(false);
  const [lastJobResult, setLastJobResult] = useState<null | JobDetails>(null);
  const [fileId, setFileId] = useState<string>();
  const { data: file } = useGetFile(fileId);

  const getFileResult = (job: JobDetails) => {
    const fileResult = job.results.find((result) => result.result_data.files);
    const file_id = fileResult?.result_data.files?.mesh[0];
    if (file_id) {
      setFileId(file_id);
      return true;
    }
    return false;
  };

  React.useEffect(() => {
    if (executedRun && jobResultsHistory && jobResultsHistory.length > 0) {
      const lastJob = jobResultsHistory[0];
      const fileResult = getFileResult(lastJob);
      if (lastJob.job_id !== lastJobResult?.job_id && fileResult) {
        setLastJobResult(lastJob);
        setExecutedRun(false);
      }
    }
  }, [jobResultsHistory]);

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
      params: {
        ...formData,
        hda_file: { file_id: selectedHdaId },
        hda_definition_index: 0,
        format: "glb",
      },
    });
    setExecutedRun(true);
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
            direction="row"
            width="100%"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack
              alignItems="flex-start"
              width="100%"
              sx={{
                [`& .parm-group`]: {
                  width: "100%",
                  maxWidth: "550px",
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
              <Stack
                direction={mobileSize ? "column" : "row"}
                gap={mobileSize ? "6px" : "12px"}
                alignItems={mobileSize ? "start" : "center"}
                width="100%"
                mb="24px"
              >
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
                  <Typography level={mobileSize ? "h4" : "h3"}>
                    {selectedJobData?.name}
                  </Typography>
                )}
                <Divider orientation={mobileSize ? "horizontal" : "vertical"} />
                <Typography level={mobileSize ? "h4" : "h3"}>
                  {selectedJobData?.description}
                </Typography>
              </Stack>
              {inputFiles.length > 0 && (
                <>
                  <Typography fontSize={20} level="h3" mb="12px">
                    Input Files
                  </Typography>
                  {inputFileParms.map((parm) => (
                    <Select
                      key={parm.name}
                      variant="soft"
                      name={parm.name}
                      placeholder={parm.label}
                      multiple={false}
                      onChange={(_, newValue) => {
                        setInputData((prev) => ({
                          ...prev,
                          [parm.name]: { file_id: newValue },
                        }));
                      }}
                    >
                      {inputFiles.map((file) => (
                        <Option key={file.file_id} value={file.file_id}>
                          {file.file_name}
                        </Option>
                      ))}
                    </Select>
                  ))}
                  <Stack sx={{ paddingBottom: "12px" }} />
                </>
              )}
              <Typography fontSize={20} level="h3" mb="12px">
                Params
              </Typography>
              <ParmGroup
                data={{ inputData }}
                group={parmTemplateGroup as hou.ParmTemplateGroup}
                onChange={handleParmChange}
              />
              <Button
                sx={{ width: "fit-content", mt: "12px", bgcolor: "#367c64", transition: '0.2s', ":hover": {bgcolor: '#367c64', opacity: 0.8} }}
                onClick={() => onSubmit(inputData)}
              >
                Run automation
              </Button>
            </Stack>
            {file?.url && (
              <Stack width="50%" height="100%" overflow="hidden">
                <SceneViewerFile src={file?.url} width="100%" />
              </Stack>
            )}
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
