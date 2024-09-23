import type { Meta, StoryObj } from "@storybook/react";
import { CookieConsentBanner } from "@components/CookieConsentBanner";
import { resetCookieConsentValue } from "react-cookie-consent";

const meta: Meta<typeof CookieConsentBanner> = {
  title: "Components/CookieConsentBanner",
  component: CookieConsentBanner,
  decorators: [
    (Story) => {
      resetCookieConsentValue("cookiesConsentAccepted");
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof CookieConsentBanner>;

export const Default: Story = {};
