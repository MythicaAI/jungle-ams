import { Button } from "@mui/joy";
import { Tag } from "@queries/tags/types";
import React from "react";

type Props = {
  tag: Tag;
  selectedTag: string;
};

export const TagCard: React.FC<Props> = ({ tag, selectedTag }) => {
  return (
    <Button
      size="sm"
      variant={tag.name === selectedTag ? "solid" : "soft"}
      color="neutral"
      sx={{ outline: "none !important" }}
    >
      {tag.name}
    </Button>
  );
};
