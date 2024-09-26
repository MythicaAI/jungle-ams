import { Box, Button, Stack, Typography } from "@mui/joy";
import { useWindowSize } from "@hooks/useWindowSize";
import { Navigate, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

const Welcome = () => {
  const { currentHeight, currentWidth } = useWindowSize();
  const shouldRender = !!sessionStorage.getItem("showOnboardingSuccess");
  const navigate = useNavigate();
  const maxWidth = 1280;

  if (!shouldRender) return <Navigate to="/" />;

  return (
    <Box height="100%">
      <Confetti
        width={currentWidth >= maxWidth ? maxWidth : currentWidth}
        height={currentHeight}
      />
      <Stack
        mt="70px"
        alignItems="center"
        justifyContent="center"
        height="calc(100% - 500px)"
        gap="20px"
      >
        <Typography level="h2">Welcome</Typography>
        <Typography level="h4">
          Congratulations, now you're ready to use the app!
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            sessionStorage.removeItem("showOnboardingSuccess");
            navigate("/");
          }}
          sx={{ width: "fit-content" }}
        >
          Let's go
        </Button>
      </Stack>
    </Box>
  );
};

export default Welcome;
