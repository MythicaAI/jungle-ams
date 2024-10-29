import { Box, Stack } from "@mui/joy";
import { TagCard } from "@components/TagCard";
import { Tag } from "@queries/tags/types";

type Props = {
  tags: Tag[];
  selectedTag: string;
  handleChangeTag: (value: string) => void;
};

const NO_FILTERING_TAG = {
  name: "All assets",
  tag_id: "all_assets",
  owner_id: "",
  created: "",
};

export const TagsPanel: React.FC<Props> = ({
  tags,
  selectedTag,
  handleChangeTag,
}) => {
  return tags && tags.length > 0 ? (
    <Stack direction="row" gap="10px" flexWrap="wrap">
      <Box onClick={() => handleChangeTag(NO_FILTERING_TAG.name)}>
        <TagCard tag={NO_FILTERING_TAG} selectedTag={selectedTag} />
      </Box>
      {tags.map((tag) => (
        <Box key={tag.tag_id} onClick={() => handleChangeTag(tag.name)}>
          <TagCard tag={tag} selectedTag={selectedTag} />
        </Box>
      ))}
    </Stack>
  ) : null;
};
