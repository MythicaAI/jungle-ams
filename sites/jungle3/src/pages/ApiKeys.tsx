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
import {addDays, format, formatDistanceToNow, parseISO} from "date-fns";

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
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@store/globalStore";


const ApiKeys = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    selectedKey: "",
  });
  const { profile } = useGlobalStore();
  const { addError, addWarning } = useStatusStore();
  const { data: keys, isLoading, error } = useGetApiKeys();
  const { mutate: addKey } = useAddApiKey();
  const { mutate: deleteKey } = useDeleteApiKey();
  const { t } = useTranslation();

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

  const formatExpiration = (expiresAt: Date, isExpired: boolean) => {
    const distance = formatDistanceToNow(expiresAt, { addSuffix: true });

    // Optional: fallback for very far dates
    const fallback = format(expiresAt, 'PPP p');
    const now = new Date();
    const isFarAway = Math.abs(+expiresAt - +now) > 1000 * 60 * 60 * 24 * 30; // >30 days
    if (isExpired) {
      return <ListItemDecorator
                  sx={{ display: "flex", alignItems: "center" }}>
                <Typography noWrap textColor="red" fontWeight="medium" >
                  Expired {isFarAway ? fallback : distance}</Typography></ListItemDecorator>;
    }
    return <ListItemDecorator
                  sx={{ display: "flex", alignItems: "center" }}>
                <Typography noWrap >
                  Expires {isFarAway ? fallback : distance}</Typography></ListItemDecorator>;
  };

  return (
    <>
      <Helmet>
        <title>Mythica • {t("apiKeys.title")}</title>
      </Helmet>
      <Card sx={{ mb: "16px", mx: "16px" }}>
        <Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography textAlign="start" level="h4">
              {t("apiKeys.yourTitle")}
            </Typography>
            {profile && (
              <Stack direction="row" alignItems="center">
                <Typography>{t("apiKeys.copyId")}</Typography>
                <IconButton>
                  <LucideCopy
                    onClick={() =>
                      navigator.clipboard.writeText(profile?.profile_id)
                    }
                  />
                </IconButton>
              </Stack>
            )}
          </Stack>
          <Typography textAlign="start">{t("apiKeys.desc")}</Typography>
        </Stack>
      </Card>
      <List>
        <Button
          variant="plain"
          color="neutral"
          startDecorator={<LucideCirclePlus />}
          onClick={() => setCreateModalOpen(true)}
          sx={{ width: "fit-content" }}
        >
          {t("apiKeys.generate")}
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
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minWidth: 0,
                    flexGrow: 1
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

                  {formatExpiration(parseISO(key.expires), key.is_expired)}

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
          <DialogTitle>{t("apiKeys.generate")}</DialogTitle>

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
                <FormLabel>{t("apiKeys.name")}</FormLabel>
                <Input name="name" autoFocus required />
              </FormControl>
              <FormControl>
                <FormLabel>{t("apiKeys.description")}</FormLabel>
                <Input name="description" required />
              </FormControl>
              <FormControl>
                <FormLabel>{t("apiKeys.expires")}</FormLabel>
                <Input
                  type="number"
                  defaultValue={30}
                  name="expires_in"
                  required
                />
              </FormControl>
              <Button type="submit">{t("apiKeys.submit")}</Button>
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

export default ApiKeys;
