import { Select, Option, Box } from "@mui/joy";
import React from "react";
import { useTranslation } from "react-i18next";

export const LanguageSelect = () => {
  const { i18n } = useTranslation();
  const [value, setValue] = React.useState(i18n.language);

  return (
    <Box sx={{ minWidth: 120 }}>
      <Select
        value={value}
        //@ts-ignore
        onChange={(_, newValue: string) => {
          i18n.changeLanguage(newValue);
          setValue(newValue);
        }}
        variant="outlined"
        color="neutral"
      >
        <Option value="en">English</Option>
        <Option value="es">Español</Option>
      </Select>
    </Box>
  );
};
