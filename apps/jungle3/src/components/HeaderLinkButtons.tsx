import { Box, Button, Stack, Typography } from "@mui/joy";
import { LucideBookText, LucideGithub } from "lucide-react";

export const HeaderLinkButtons = () => {
  return (
    <Stack direction="row">
      <Box
        width="100%"
        component="a"
        href="https://github.com/MythicaAI"
        target="_blank"
        sx={{
          display: "flex",
          alignItems: "center",
          height: "42px",
          minWidth: "100px",
        }}
      >
        <Button
          variant="plain"
          color="neutral"
          sx={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            padding: "0 8px",
            gap: "5px",
          }}
        >
          <Typography>GitHub</Typography>
          <LucideGithub />
        </Button>
      </Box>
      <Box
        width="100%"
        component="a"
        href={`${window.location.origin}/docs`}
        target="_blank"
        sx={{
          display: "flex",
          alignItems: "center",
          height: "42px",
          minWidth: "75px",
        }}
      >
        <Button
          variant="plain"
          color="neutral"
          sx={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            padding: "0",
            gap: "5px",
          }}
        >
          <Typography>API</Typography>
          <LucideBookText />
        </Button>
      </Box>
    </Stack>
  );
};
