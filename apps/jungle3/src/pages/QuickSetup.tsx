import { Box, Stack, Typography } from "@mui/joy";
import ProfileSettings from "./ProfileSettings";

const QuickSetup = () => {
  return (
    <Stack height="calc(100% - 300px)" justifyContent="center">
      <Typography level="h4">You're almost there.</Typography>
      <Typography>Is this info correct?</Typography>
      <Box width="100%" maxWidth="500px" margin="0 auto">
        <ProfileSettings />
      </Box>
    </Stack>
  );
};

export default QuickSetup;
