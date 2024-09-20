import { Stack, Typography } from "@mui/joy";
import { LucideCookie } from "lucide-react";
import CookieConsent from "react-cookie-consent";

export const CookieConsentBanner = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Close"
      cookieName="cookiesConsentAccepted"
      style={{ background: "#2B373B", alignItems: "center" }}
      buttonStyle={{
        color: "#4e503b",
        fontSize: "13px",
        borderRadius: "4px",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap="10px"
      >
        <LucideCookie />
        <Typography sx={{ color: "#fff" }}>
          This website uses cookies to enhance the user experience. By
          continuing to browse the site you're agreeing to our use of cookies.
        </Typography>
      </Stack>
    </CookieConsent>
  );
};
