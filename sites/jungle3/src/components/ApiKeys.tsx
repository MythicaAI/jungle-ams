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

import { LucideCirclePlus, LucideCopy, LucideKeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import {
  extractValidationErrors,
  translateError,
} from "../services/backendCommon.ts";
import { useGlobalStore } from "../stores/globalStore.ts";
import { AxiosError } from "axios";
import { Helmet } from "react-helmet-async";
import { useStatusStore } from "../stores/statusStore.ts";
import { DeleteButton } from "./DeleteButton/index.tsx";
import { api } from "../services/api";

export type Key = {
  created: string;
  description: string;
  expires: string;
  name: string;
  value: string;
};

export const ApiKeys = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { authToken } = useGlobalStore();
  const [keys, setKeys] = useState<Key[]>([]);
  const { addError, addWarning } = useStatusStore();

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  const fetchKeys = () => {
    setIsLoading(true);

    api
      .get({ path: "/keys" })
      .then((r) => {
        setKeys(r);
        setIsLoading(false);
      })
      .catch((err) => {
        handleError(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!authToken) {
      return;
    }

    fetchKeys();
  }, [authToken]);

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
          onClick={() => setOpen(true)}
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
          keys.map((key) => (
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
                    <DeleteButton
                      url={`/keys/${key.value}`}
                      name={key.name}
                      onDeleteSuccess={fetchKeys}
                    />
                  </Stack>
                </ListItemDecorator>
              </Card>
            </ListItem>
          ))}
      </List>
      <Modal open={open} onClose={() => setOpen(false)}>
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

              api
                .post({ path: "/keys", body: formJson })
                .then(() => fetchKeys());
              setOpen(false);
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
    </>
  );
};
