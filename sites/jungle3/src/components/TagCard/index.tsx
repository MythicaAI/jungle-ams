import {Button, Typography} from "@mui/joy";
import {Tag} from "@queries/tags/types";
import React from "react";

type Props = {
  tag: Tag;
  selectedTag: string;
};

export const TagCard: React.FC<Props> = ({tag, selectedTag}) => {
  return (
    <Button
      size="sm"
      variant={tag.name === selectedTag ? "solid" : "soft"}
      color="neutral"
      sx={{
        outline: "none !important",
        borderRadius: "20px",
        padding: "8px 16px",
        minWidth: "fit-content",
        whiteSpace: "nowrap",
        margin: "0 4px",
        height: "36px",
      }}
    >
      <Typography fontSize={14} fontWeight={tag.name === selectedTag ? "600" : "500"}>
        {tag.name}
      </Typography>
    </Button>
  );
};
