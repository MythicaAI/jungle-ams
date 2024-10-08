import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export const useOnboarding = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user?.first_login && !localStorage.getItem("shouldStartOnboarding")) {
      localStorage.setItem("shouldStartOnboarding", "true");
      navigate("/quick-setup");
    }
  }, [user]);
};
