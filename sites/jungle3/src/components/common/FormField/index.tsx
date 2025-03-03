import { Stack, Typography } from "@mui/joy";
import React from "react";

type Props = {
  children: React.ReactNode;
  isHidden?: boolean;
  error?: {
    message: string;
  };
};

export const FormField: React.FC<Props> = ({ error, children, isHidden }) => {
  return (
    <Stack width="100%" alignItems="start" display={isHidden ? "none" : "flex"}>
      {children}
      {error && (
        <Typography fontSize="12px" color="danger">
          {error.message}
        </Typography>
      )}
    </Stack>
  );
};
