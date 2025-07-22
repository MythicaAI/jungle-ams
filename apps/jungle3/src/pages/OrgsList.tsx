import { useState } from "react";
import {
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Input,
  List,
  ListDivider,
  ListItem,
  ListItemDecorator,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import { Form } from "react-router-dom";
import { ResolvedOrgRef, OrgResponse } from "types/apiTypes";
import { useGlobalStore } from "@store/globalStore";
import { LucideShield, LucideUser } from "lucide-react";
import React from "react";
import { Helmet } from "react-helmet-async";
import { api } from "@services/api";
import { useTranslation } from "react-i18next";

const defaultOrg = (): OrgResponse => {
  return {
    org_id: "",
    name: "",
    description: "",
    created: "",
    updated: "",
  };
};

export const RolesList = ({ orgRoles }: { orgRoles: ResolvedOrgRef[] }) => {
  const iconForRole = (role: string) => {
    switch (role) {
      case "admin":
        return <LucideShield />;
      default:
        return <LucideUser />;
    }
  };

  return (
    <List size={"lg"}>
      {orgRoles.map((ref) => (
        <React.Fragment key={ref.org_id}>
          <ListItem>
            <ListItemDecorator>{iconForRole(ref.role)}</ListItemDecorator>
            <ListItemDecorator>
              {ref.org_name} ({ref.role})
            </ListItemDecorator>
          </ListItem>
          <ListDivider inset="startContent" />
        </React.Fragment>
      ))}
    </List>
  );
};

const OrgsList: React.FC = () => {
  const [org, setOrg] = useState<OrgResponse>(defaultOrg());
  const [creating, setCreating] = useState<boolean>(false);
  const { orgRoles, setOrgRoles } = useGlobalStore();
  const { t } = useTranslation();

  const createOrg = () => {
    setCreating(true);
    api.post<OrgResponse>({ path: "/orgs", body: org }).then((data) => {
      setCreating(false);
      setOrg(data);

      // query for updated org refs
      api.get<ResolvedOrgRef[]>({ path: "/orgs" }).then((data) => {
        setOrgRoles(data);
      });
    });
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setOrg((prevOrg) => ({
      ...prevOrg,
      [name]: value,
    }));
  };

  const Title = () => {
    return (
      <Card sx={{ margin: "0 16px" }}>
        <Stack>
          <Typography textAlign="start" level="h4">
            {t("manageOrgs.title")}
          </Typography>
          <Typography textAlign="left">
            {t("manageOrgs.description")}
          </Typography>
        </Stack>
      </Card>
    );
  };

  const createForm = (
    <Sheet
      variant="outlined"
      sx={{
        mx: "auto",
        py: 3,
        px: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: "sm",
        boxShadow: "md",
      }}
    >
      <Typography level="h4" component="h1">
        <b>{t("manageOrgs.create")}</b>
      </Typography>
      <Typography>{t("manageOrgs.notMember")}</Typography>
      <Form>
        <FormControl>
          <FormLabel>{t("manageOrgs.name")}</FormLabel>
          <Input name="name" onChange={handleInputChange}></Input>
        </FormControl>
        <FormControl>
          <FormLabel>{t("manageOrgs.desc")}</FormLabel>
          <Input name="description" onChange={handleInputChange}></Input>
        </FormControl>

        <Button onClick={createOrg} disabled={creating} sx={{ mt: "20px" }}>
          {creating ? t("manageOrgs.creating") : t("manageOrgs.createBtn")}
        </Button>
      </Form>
    </Sheet>
  );

  return (
    <>
      <Title />
      <Sheet
        variant="outlined"
        sx={{
          mx: "16px",
          my: 2,
          py: 3,
          px: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: "sm",
          boxShadow: "md",
        }}
      >
        <Helmet>
          <title>Mythica • {t("manageOrgs.organizations")}</title>
        </Helmet>
        {orgRoles && orgRoles.length > 0 && (
          <>
            <Typography level="h4" component="h1">
              <b>{t("manageOrgs.memberships")}</b>
            </Typography>
            <Card>
              <RolesList orgRoles={orgRoles} />
            </Card>
            <Divider />
          </>
        )}
        {createForm}
      </Sheet>
    </>
  );
};

export default OrgsList;
