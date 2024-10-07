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

const Title = () => {
  return (
    <Card sx={{ margin: "0 16px" }}>
      <Stack>
        <Typography textAlign="start" level="h4">
          Manage organizations
        </Typography>
        <Typography textAlign="left">
          Access your memberships and create new organizations
        </Typography>
      </Stack>
    </Card>
  );
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
        <b>Create Organization</b>
      </Typography>
      <Typography>
        You are currently not part of any organizations. Would you like to
        create a new organization?
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

        <Button onClick={createOrg} disabled={creating} sx={{ mt: "20px" }}>
          {creating ? "Creating..." : "Create"}
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
          <title>Mythica • Organizations</title>
        </Helmet>
        {orgRoles && orgRoles.length > 0 && (
          <>
            <Typography level="h4" component="h1">
              <b>Memberships</b>
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
