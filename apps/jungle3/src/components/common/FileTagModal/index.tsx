import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import { Tag } from "@queries/tags/types";
import { FileUploadStatus } from "@store/uploadStore";

type Props = {
  tagModalOpen: {
    isOpen: boolean;
    selectedFile: FileUploadStatus | null;
  };
  tagModalInputs: {
    dropdownTag: string | null;
    customTag: string | null;
  };
  setTagModalInputs: (value: {
    dropdownTag: string | null;
    customTag: string | null;
  }) => void;
  handleCloseModal: () => void;
  handleUpdateTag: () => void;
  allTags?: Tag[];
  hasTagsRole?: boolean;
};

export const FileTagModal: React.FC<Props> = ({
  tagModalOpen,
  handleCloseModal,
  tagModalInputs,
  setTagModalInputs,
  handleUpdateTag,
  allTags,
  hasTagsRole,
}) => {
  return (
    <Modal
      aria-labelledby="tag-modal"
      open={tagModalOpen.isOpen}
      onClose={handleCloseModal}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
        }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />
        <Typography
          component="h2"
          id="tag-modal"
          level="h4"
          textColor="inherit"
          sx={{ fontWeight: "lg", mb: 3 }}
        >
          Edit tag
        </Typography>
        <Stack mb="20px" gap="5px">
          <FormControl sx={{ marginBottom: "6px" }}>
            <FormLabel>Select an existing tag</FormLabel>
            <Select
              disabled={!!tagModalInputs.customTag}
              name="tag"
              value={
                tagModalInputs.dropdownTag ??
                (tagModalOpen?.selectedFile?.tags &&
                tagModalOpen?.selectedFile?.tags.length > 0
                  ? tagModalOpen?.selectedFile?.tags[0]?.tag_id
                  : null)
              }
              onChange={(_, newValue) => {
                setTagModalInputs({
                  dropdownTag: newValue,
                  customTag: null,
                });
              }}
              placeholder="Select a tag"
            >
              {allTags?.map((tag) => (
                <Option value={tag.tag_id}>{tag.name}</Option>
              ))}
            </Select>
          </FormControl>
          {hasTagsRole && (
            <FormControl sx={{ marginBottom: "6px" }}>
              <FormLabel>Create a custom tag</FormLabel>
              <Input
                name="customFileTag"
                variant="outlined"
                placeholder="Create a new tag"
                value={tagModalInputs.customTag ?? ""}
                onChange={(e) => {
                  setTagModalInputs({
                    dropdownTag: null,
                    customTag: e.target.value,
                  });
                }}
              />
            </FormControl>
          )}
        </Stack>
        <Stack direction="row" justifyContent="flex-end" gap="8px">
          <Button variant="plain" size="sm" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="solid"
            size="sm"
            onClick={() => {
              handleUpdateTag();
              handleCloseModal();
            }}
          >
            Confirm
          </Button>
        </Stack>
      </Sheet>
    </Modal>
  );
};
