import {
  Button,
  Card,
  CircularProgress,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Modal,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { addDays } from "date-fns";

import {
  LucideCirclePlus,
  LucideCopy,
  LucideKeyRound,
  LucideTrash,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  extractValidationErrors,
  translateError,
} from "@services/backendCommon";
import { Helmet } from "react-helmet-async";
import { useStatusStore } from "@store/statusStore.ts";
import {
  Key,
  useAddApiKey,
  useDeleteApiKey,
  useGetApiKeys,
} from "@queries/apiKeys";
import { DeleteModal } from "@components/common/DeleteModal";

export const ApiKeys = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    selectedKey: "",
  });
  const { addError, addWarning } = useStatusStore();
  const { data: keys, isLoading, error } = useGetApiKeys();
  const { mutate: addKey } = useAddApiKey();
  const { mutate: deleteKey } = useDeleteApiKey();

  const handleError = (err: any) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  const handleDeleteCleaup = () => {
    setDeleteModal({ open: false, selectedKey: "" });
  };

  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error]);

  return (
    <>
      <Helmet>
        <title>Mythica • API keys</title>
      </Helmet>
      <List>
        <Button
          variant="plain"
          color="neutral"
          startDecorator={<LucideCirclePlus />}
          onClick={() => setCreateModalOpen(true)}
          sx={{ width: "fit-content" }}
        >
          Generate new key
        </Button>

        <ListDivider />
        {isLoading && (
          <Stack direction="row" width="100%" justifyContent="center">
            <CircularProgress />
          </Stack>
        )}
        {keys &&
          keys.map((key: Key) => (
            <ListItem sx={{ flexGrow: 1 }} key={key.value}>
              <Card sx={{ width: "100%", flexDirection: "row" }}>
                <ListItemContent
                  sx={{
                    width: "calc(100% - 82px)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <LucideKeyRound />
                  <Stack>
                    <Typography textAlign="left" fontWeight="bold" noWrap>
                      {key.name}
                    </Typography>
                    <Typography textAlign="left" fontSize={14}>
                      {key.description}
                    </Typography>
                  </Stack>
                </ListItemContent>
                <Divider orientation="vertical" sx={{ margin: "0" }} />
                <ListItemDecorator
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Stack direction={"row"} minWidth="72px">
                    <IconButton>
                      <LucideCopy
                        onClick={() => navigator.clipboard.writeText(key.value)}
                      />
                    </IconButton>

                    <IconButton
                      onClick={() =>
                        setDeleteModal({ open: true, selectedKey: key.value })
                      }
                    >
                      <LucideTrash />
                    </IconButton>
                  </Stack>
                </ListItemDecorator>
              </Card>
            </ListItem>
          ))}
      </List>
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <ModalDialog sx={{ width: "100%", maxWidth: "500px" }}>
          <DialogTitle>Generate new key</DialogTitle>

          <form
            onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries((formData as any).entries());

              const { expires_in } = formJson;

              formJson.expires = addDays(
                new Date(),
                Number(expires_in),
              ).toISOString();
              event.preventDefault();

              addKey({
                name: formJson.name,
                description: formJson.description,
                expires: formJson.expires,
              });

              setCreateModalOpen(false);
            }}
          >
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input name="name" autoFocus required />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input name="description" required />
              </FormControl>
              <FormControl>
                <FormLabel>Expires in, days</FormLabel>
                <Input
                  type="number"
                  defaultValue={30}
                  name="expires_in"
                  required
                />
              </FormControl>
              <Button type="submit">Submit</Button>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
      <DeleteModal
        open={deleteModal.open}
        handleClose={handleDeleteCleaup}
        handleConfirm={() => {
          deleteKey(deleteModal.selectedKey, {
            onSuccess: () => handleDeleteCleaup(),
            onError: () => handleDeleteCleaup(),
          });
        }}
      />
    </>
  );
};
