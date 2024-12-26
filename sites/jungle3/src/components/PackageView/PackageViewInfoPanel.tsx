import React from "react";
import { AssetVersionResponse } from "types/apiTypes";
import { Card, Stack, Typography, Chip } from "@mui/joy";
import { LucideGitCommitVertical, LucidePackage } from "lucide-react";
import { DownloadButton } from "@components/common/DownloadButton";
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
        <Stack>
          <Typography level={"h4"}>{av.name}</Typography>
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
      <Card>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          gap="8px"
        >
          <Typography fontSize={12} color="neutral">
            created by
          </Typography>
          <Typography level={"h4"}>{av.owner_name}</Typography>
        </Stack>
      </Card>

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
    </Stack>
  );
};
