import React from "react";
import { AssetVersionResponse } from "types/apiTypes";
import {
  Card,
  Stack,
  Typography,
  Chip,
  Divider,
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Button,
} from "@mui/joy";
import {
  LucideGitCommitVertical,
  LucidePackage,
  LucideFile,
  LucideChevronRight,
} from "lucide-react";
import { DownloadButton } from "@components/common/DownloadButton";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useGetJobDefinition } from "@queries/packages";
import { useSceneStore } from "@store/sceneStoreEmbedded";

export const PackageViewInfoPanel: React.FC<AssetVersionResponse> = (
  av: AssetVersionResponse,
) => {
  const { asset_id, version_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: jobDefinitions } =
    useGetJobDefinition(
      asset_id as string, 
      (version_id as string)?.split("."));

  const { hdaSchemas } = useSceneStore();
    const matchesHdaSchema = hdaSchemas.find(
      (schema) => schema.name === av?.name,
    );
    
  const convertCommitRefToLink = (ref: string) => {
    if (ref && ref.startsWith("git@github.com")) {
      const site_user_path = ref.split(":");
      const user_repo_commit = site_user_path[1].split("/");
      const repo = user_repo_commit[1].split(".")[0];
      if (user_repo_commit.length == 3) {
        return (
          <a
            href={`https://github.com/${user_repo_commit[0]}/${repo}/commits/${user_repo_commit[2]}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LucideGitCommitVertical />
            {repo} {user_repo_commit[2].substring(0, 8)}
          </a>
        );
      } else if (user_repo_commit.length == 2) {
        return (
          <a
            href={`https://github.com/${user_repo_commit[0]}/${repo}/}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LucideGitCommitVertical />
            {repo}
          </a>
        );
      }
    }
    return <i>{ref}</i>;
  };

  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  };

  const bundleSize = formatBytes(
    av?.contents["files"]?.reduce((prev, curr) => {
      return curr.size + prev;
    }, 0),
  );

  const showAutomations = 
    (jobDefinitions && import.meta.env.VITE_MYTHICA_ENVIRONMENT === "dev")||
    matchesHdaSchema;

  return (
    <Stack gap="10px">
      {(showAutomations) && (
        <Button
          variant="outlined"
          color="neutral"
          sx={{ width: "fit-content", alignSelf: "end", pr: "10px" }}
          endDecorator={<LucideChevronRight width="20px" height="20px" />}
          onClick={() => {
            navigate(`${location.pathname}/jobs`);
          }}
        >
          Visit automations
        </Button>
      )}
      <Card>
        <Stack>
          <Stack direction={"row"} alignItems={"center"} gap={"8px"}>
            <Typography level={"h3"}>{av.name}</Typography>
            <Typography>by {av.owner_name}</Typography>
          </Stack>
          <Divider />
          <Typography
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {convertCommitRefToLink(av.commit_ref)}
          </Typography>
        </Stack>
      </Card>
      {av.blurb ? (
        <Card>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            gap="8px"
          >
            <Typography fontSize={18} fontWeight="bold">
              {av.blurb}
            </Typography>
          </Stack>
        </Card>
      ) : null}

      <Card>
        <Typography fontSize={18} textAlign="left">
          {av.description}
        </Typography>
        <Stack direction="row" justifyContent="space-between">
          <DownloadButton
            file_id={av.package_id}
            icon={<LucidePackage />}
            text="Download"
          />

          <Chip
            key={av.version?.join(".")}
            variant="soft"
            color={"neutral"}
            size="lg"
            component={Link}
            to={`/assets/${av.asset_id}/versions/${av.version.join(".")}`}
            sx={{ borderRadius: "xl" }}
          >
            {av.version.join(".")}
          </Chip>
        </Stack>
      </Card>
      <Card
        variant="outlined"
        sx={{ width: "100%", maxWidth: { xs: "100%", md: 500 }, p: 0 }}
      >
        <AccordionGroup>
          <Accordion>
            <AccordionSummary
              slotProps={{
                button: {
                  sx: {
                    ":focus": { outline: "none" },
                    borderRadius: "8px",
                    gap: "9px",
                    py: "10px",
                  },
                },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
              >
                <Typography fontSize={18} fontWeight={600}>
                  Bundle size
                </Typography>

                <Typography>{bundleSize}</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              {av.contents["files"]?.map((avc, idx, arr) => {
                const isLast = idx === arr.length - 1;
                return (
                  <>
                    <Stack
                      width="100%"
                      direction="row"
                      justifyContent="space-between"
                      gap="10px"
                      sx={{
                        ":not(:last-child)": {
                          mb: "6px",
                        },
                        ":not(:first-child)": {
                          mt: "6px",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {avc.file_name}
                      </Typography>
                      <Stack
                        direction="row"
                        gap="6px"
                        minWidth="100px"
                        justifyContent="flex-end"
                      >
                        <Typography fontSize={14}>
                          {avc.size ? `${formatBytes(avc.size)}` : ""}
                        </Typography>
                        <LucideFile />
                      </Stack>
                    </Stack>
                    {!isLast && <Divider />}
                  </>
                );
              })}
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </Card>
    </Stack>
  );
};
