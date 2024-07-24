import {AssetVersionResponse} from "../types/apiTypes.ts";
import {Card, Box, Stack, Typography, Divider} from "@mui/joy";
import React from "react";
import {LucideGitCommitVertical} from "lucide-react";

export const PackageViewInfoPanel: React.FC<AssetVersionResponse> = (av: AssetVersionResponse) => {

  const convertCommitRefToLink = (ref: string) => {
    if (ref && ref.startsWith("git@github.com")) {
      const site_user_path = ref.split(":");
      const user_repo_commit = site_user_path[1].split("/");
      const repo = user_repo_commit[1].split('.')[0];
      if (user_repo_commit.length == 3) {
        return <a href={`https://github.com/${user_repo_commit[0]}/${repo}/commits/${user_repo_commit[2]}`}>
          <LucideGitCommitVertical/>{repo} {user_repo_commit[2].substring(0, 8)}
        </a>;
      }
      else if (user_repo_commit.length == 2) {
        return <a href={`https://github.com/${user_repo_commit[0]}/${repo}/}`}>
          <LucideGitCommitVertical/>{repo}
        </a>;
      }
    }
    return ref;
  }

  return <Card>
    <Box>
    <Stack>
      <Typography level={"h4"}>
        {av.org_name}::{av.name}
      </Typography>
      <Typography>
        by {av.author_name}
      </Typography>
      <Typography sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
        {convertCommitRefToLink(av.commit_ref)}
      </Typography>
      <Divider orientation={"horizontal"} />
      <Typography>{av.description}</Typography>
    </Stack>
    </Box></Card>;
}
