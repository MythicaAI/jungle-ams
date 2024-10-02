import { Box, Stack, Typography } from "@mui/joy";
import React from "react";
import { SORTING_BUTTONS } from "./constants";

export type SortType = "latest" | "oldest";

type Props = {
  sorting: SortType;
  setSorting: (value: SortType) => void;
};

export const BottomSortingPanel: React.FC<Props> = ({
  sorting,
  setSorting,
}) => {
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
      {SORTING_BUTTONS.map((button) => (
        <Box
          component="span"
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
