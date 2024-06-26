import React, {useState} from 'react';
import {
    Box,
    Input,
    Button,
    FormControl,
    FormLabel,
    Divider,
    Sheet,
    Typography,
    List,
    ListItemDecorator, ListItem, ListDivider, ListItemContent
} from '@mui/joy';
import {getData, postData} from "./services/backendCommon.ts";
import {Org} from "./schema_types/profiles.ts";
import {Form} from "react-router-dom";
import {ResolvedOrgRef} from './types/apiTypes.ts';
import {useGlobalStore} from "./stores/globalStore.ts";
import {LucideShield, LucideUser, LucideUser2} from "lucide-react";

const defaultOrg = (): Org => {
    return {
        id: '',
        name: '',
        description: '',
        created: '',
        updated: '',
    }
}

const OrgsList: React.FC = () => {
    const [org, setOrg] = useState<Org>(defaultOrg());
    const [creating, setCreating] = useState<boolean>(false);
    const {orgRoles, setOrgRoles} = useGlobalStore();

    const createOrg = () => {
        setCreating(true);
        postData<Org>("orgs", org).then((data) => {
            setCreating(false)
            setOrg(data);

            // query for updated org refs
            getData<ResolvedOrgRef[]>("orgs").then((data) => {
                setOrgRoles(data)
            })
        })
    }
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setOrg((prevOrg) => ({
            ...prevOrg,
            [name]: value,
        }));
    };

    const createForm = (
        <Sheet
            variant="outlined"
            sx={{
                maxWidth: 400,
                mx: 'auto', // margin left & right
                my: 4, // margin top & bottom
                py: 3, // padding top & bottom
                px: 2, // padding left & right
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRadius: 'sm',
                boxShadow: 'md',
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
                {creating ? 'Creating...' : 'Create'}
            </Button>
            </Form>
        </Sheet>
    );

    const iconForRole = (role: string) => {
        switch (role) {
            case "admin":
                return <LucideShield />
            default:
                return <LucideUser />
        }
    }

    if (orgRoles === undefined) {
        return (<Box className="full-size-box">loading...</Box>);
    } else if (orgRoles.length === 0) {
        return (<Box className="full-size-box" id="create-form">You are currently not part of any organizations.
            Would you like to create a new organization? {createForm}</Box>);
    }
    return (<Box className="full-size-box">
        <Typography level="h4" component="h1">
            <b>Memberships</b>
        </Typography>
        <List size={"lg"}>
            <ListItem key={"header"}>
                <ListItemDecorator sx={{flex: 1}}>Role</ListItemDecorator>
                <ListItemDecorator sx={{flex: 1}}>Organization</ListItemDecorator>
            </ListItem>
            {orgRoles.map(ref => (
                <React.Fragment>
                    <ListItem key={ref.org_id}>
                        <ListItemDecorator>{iconForRole(ref.role)}</ListItemDecorator>
                        <ListItemDecorator>{ref.role}</ListItemDecorator>
                        <ListItemContent><b>{ref.org_name}</b></ListItemContent>
                    </ListItem>
                    <ListDivider inset="startContent" />
                </React.Fragment>))}

        </List>
        <Divider/>
        {createForm}
    </Box>);
};

export default OrgsList;