import { useState } from "react";
import {
  Box,
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
  Typography,
} from "@mui/joy";
import { Form } from "react-router-dom";
import { ResolvedOrgRef, OrgResponse } from "./types/apiTypes.ts";
import { useGlobalStore } from "./stores/globalStore.ts";
import { LucideShield, LucideUser } from "lucide-react";
import React from "react";
import { Helmet } from "react-helmet-async";
import { api } from "./services/api";

const defaultOrg = (): OrgResponse => {
  return {
    org_id: "",
    name: "",
    description: "",
    created: "",
    updated: "",
  };
};

const OrgsList: React.FC = () => {
  const [org, setOrg] = useState<OrgResponse>(defaultOrg());
  const [creating, setCreating] = useState<boolean>(false);
  const { orgRoles, setOrgRoles } = useGlobalStore();

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

  const createForm = (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 1000,
        mx: "auto", // margin left & right
        my: 4, // margin top & bottom
        py: 3, // padding top & bottom
        px: 2, // padding left & right
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: "sm",
        boxShadow: "md",
      }}
    >
      <Typography level="h4" component="h1">
        <b>Create Organization</b>
      </Typography>
      <Form>
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input name="name" onChange={handleInputChange}></Input>
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input name="description" onChange={handleInputChange}></Input>
        </FormControl>

        <Button onClick={createOrg} disabled={creating}>
          {creating ? "Creating..." : "Create"}
        </Button>
      </Form>
    </Sheet>
  );

  const iconForRole = (role: string) => {
    switch (role) {
      case "admin":
        return <LucideShield />;
      default:
        return <LucideUser />;
    }
  };

  const rolesList = (
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

  if (!orgRoles) {
    return <Box className="full-size-box">loading...</Box>;
  } else if (orgRoles.length === 0) {
    return (
      <Box className="full-size-box" id="create-form">
        You are currently not part of any organizations. Would you like to
        create a new organization? {createForm}
      </Box>
    );
  }
  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 1000,
        mx: "auto", // margin left & right
        my: 4, // margin top & bottom
        py: 3, // padding top & bottom
        px: 2, // padding left & right
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: "sm",
        boxShadow: "md",
      }}
    >
      <Helmet>
        <title>Mythica • Organizations</title>
      </Helmet>
      <Typography level="h4" component="h1">
        <b>Memberships</b>
      </Typography>
      <Card>{rolesList}</Card>
      <Divider />
      {createForm}
    </Sheet>
  );
};

export default OrgsList;
