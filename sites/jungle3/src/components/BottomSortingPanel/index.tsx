import React from "react";
import { Box, Stack, Typography } from "@mui/joy";
import { useTranslation } from "react-i18next";

export type SortType = "latest" | "oldest";

type Props = {
  sorting: SortType;
  setSorting: (value: SortType) => void;
};

export const BottomSortingPanel: React.FC<Props> = ({
  sorting,
  setSorting,
}) => {
  const { t } = useTranslation();
  const sortingButtons = t("common.sortingPanel.options", {
    returnObjects: true,
  }) as { value: string; label: string }[];

  return (
    <Stack
      direction="row"
      sx={{
        borderRadius: "32px",
        gap: "4px",
        padding: "4px",
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#fff",
        zIndex: 10,
      }}
    >
      {sortingButtons.map((button) => (
        <Box
          component="span"
          key={button.value}
          sx={{
            background: sorting === button.value ? "#000" : "#fff",

            borderRadius: "32px",
            padding: "8px 20px",
            cursor: "pointer",
          }}
          onClick={() => setSorting(button.value as SortType)}
        >
          <Typography
            sx={{ color: sorting === button.value ? "#fff" : "#000" }}
          >
            {button.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};
