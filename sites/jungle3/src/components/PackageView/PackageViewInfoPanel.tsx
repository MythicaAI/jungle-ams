import React from "react";
import { AssetVersionResponse } from "types/apiTypes";
import {Card, Stack, Typography, Chip, Divider, ListItem, List} from "@mui/joy";
import { LucideGitCommitVertical, LucidePackage, LucideFile } from "lucide-react";
import { DownloadButton } from "@components/common/DownloadButton";
import { Link } from "react-router-dom";
import {ListItemAvatar} from "@mui/material";

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
    return <i>{ref}</i>;
  };

  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }

  return (
    <Stack gap="10px">
      <Card>
        <Stack>
          <Stack direction={"row"} alignItems={"center"} gap={"8px"}>
            <Typography level={"h3"}>{av.name}</Typography>
            <Typography level={"h5"}>by {av.owner_name}</Typography>
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
      {av.blurb ?
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
        : null }

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
      <Card variant="outlined" sx={{ width: "100%", maxWidth: 500, p: 2 }}>
        <List>
        {av.contents['files'].map((avc) =>
          <ListItem key={avc.file_id} sx={{ display: "flex", gap: 2 }}>
            <ListItemAvatar>
              <LucideFile />
            </ListItemAvatar>
            <Stack
              direction="row"
              sx={{ flex: 1, minWidth: 0, alignItems: "left", justifyContent: "space-between" }}
            >
              <Typography
                sx={{
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {avc.file_name}
              </Typography>
              <Typography sx={{ color: "text.secondary", minWidth: 50, textAlign: "right" }}>
                {avc.size ? `${formatBytes(avc.size)}` : ""}
              </Typography>
            </Stack>
          </ListItem>
        )}
        </List>
      </Card>
    </Stack>
  );
};
