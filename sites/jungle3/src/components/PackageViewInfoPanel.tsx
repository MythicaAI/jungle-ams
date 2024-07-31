import { AssetVersionResponse } from "../types/apiTypes.ts";
import { Card, Box, Stack, Typography, Divider, Chip } from "@mui/joy";
import React from "react";
import { LucideGitCommitVertical, LucidePackage } from "lucide-react";
import { DownloadButton } from "./DownloadButton/index.tsx";
import { Link } from "react-router-dom";

export const PackageViewInfoPanel: React.FC<AssetVersionResponse> = (
  av: AssetVersionResponse,
) => {
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
    return ref;
  };

  return (
    <Stack gap="10px">
      <Card>
        <Box>
          <Stack>
            <Typography level={"h4"}>
              {av.org_name}::{av.name}
            </Typography>
            <Typography>by {av.author_name}</Typography>
            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {convertCommitRefToLink(av.commit_ref)}
            </Typography>
            {av.description && (
              <>
                <Divider orientation={"horizontal"} sx={{ my: "10px" }} />
                <Typography textAlign="left">{av.description}</Typography>
              </>
            )}
          </Stack>
        </Box>
      </Card>
      <Stack direction="row" justifyContent="space-between">
        <DownloadButton file_id={av.package_id} icon={<LucidePackage />} />
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
    </Stack>
  );
};
