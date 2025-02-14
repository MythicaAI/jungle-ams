import ImageWithSkeleton from "@components/common/ImageWithSkeleton";
import { Button, Typography } from "@mui/joy";
import { Tag } from "@queries/tags/types";
import React from "react";

type Props = {
  tag: Tag;
  selectedTag: string;
};

const getTagThumbnailSrc = (tag: Tag) => {
  if (!tag.contents) {
    return { url: "/houdini.svg" };
  }

  const file_name = tag.contents?.thumbnails[0]?.file_name;
  const content_hash = tag.contents?.thumbnails[0]?.content_hash;
  const extension = file_name?.split(".").at(-1);
  const baseUrl = import.meta.env.VITE_IMAGES_BASE_URL;
  return {
    url: `${baseUrl}/${content_hash}.${extension}`,
  };
};

export const TagCard: React.FC<Props> = ({ tag, selectedTag }) => {
  const { url } = getTagThumbnailSrc(tag);

  return (
    <Button
      size="sm"
      variant={tag.name === selectedTag ? "solid" : "soft"}
      color="neutral"
      sx={{
        outline: "none !important",
        display: "flex",
        padding: "10px",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <ImageWithSkeleton
        width="40px"
        height="40px"
        src={url}
        sx={{ borderRadius: "4px" }}
        alt={tag.name}
      />
      <Typography fontSize={14}>{tag.name}</Typography>
    </Button>
  );
};
