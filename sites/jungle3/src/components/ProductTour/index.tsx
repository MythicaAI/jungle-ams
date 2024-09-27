import Joyride, { CallBackProps, STATUS } from "react-joyride";
import { STEPS } from "./constants";
import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

export const ProductTour = () => {
  const { user } = useAuth0();
  const shouldRun =
    localStorage.getItem("shouldStartProductTour") === "true" &&
    localStorage.getItem("shouldStartOnboarding") === "false";

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    //@ts-ignore
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      localStorage.setItem("shouldStartProductTour", "false");
    }
  };

  React.useEffect(() => {
    if (user?.first_login && !localStorage.getItem("shouldStartProductTour")) {
      localStorage.setItem("shouldStartProductTour", "true");
    }
  }, [user]);

  return (
    <Joyride
      //@ts-ignore
      steps={STEPS}
      run={shouldRun}
      continuous
      showSkipButton
      spotlightClicks
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#000",
          textColor: "#004a14",
        },
      }}
    />
  );
};
