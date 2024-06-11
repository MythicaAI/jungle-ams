import React, {useEffect, useState} from 'react';
import {Box, Input, Button, List, ListItem, FormControl, FormLabel, Textarea} from '@mui/joy';
import {getData, postData} from "./services/backendCommon.ts";
import {Org} from "./schema_types/profiles.ts";
import {Form} from "react-router-dom";
import {ResolvedOrgRef} from 'types/apiTypes.ts';

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
  const [orgRefs, setOrgRefs] = useState<ResolvedOrgRef[]>();
  const [org, setOrg] = useState<Org>(defaultOrg());
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    getData<ResolvedOrgRef[]>("orgs").then((data) => {setOrgRefs(data)});
  }, []);

  const createOrg = () => {
      setCreating(true);
      postData<Org>("orgs", org).then((data) => {
          setCreating(false)
          setOrg(data);

          // query for updated org refs
          getData<ResolvedOrgRef[]>("orgs").then((data) => {
              setOrgRefs(data)
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
          <Form>
              <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input name="name" onChange={handleInputChange}></Input>
              </FormControl>
              <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Input name="description" onchange={handleInputChange}></Input>
              </FormControl>
              <Button onClick={createOrg} disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
          </Form>
      );

  if (orgRefs === undefined) {
      return (<Box className="full-size-box">loading...</Box>);
  } else if (orgRefs.length === 0) {
      return (<Box className="full-size-box" id="create-form">You are currently not part of any organizations.
          Would you like to create a new organization? {createForm}</Box>);
  }
  return (<Box className="full-size-box">
      <table>
          <thead>
          <tr>
              <td>Org</td>
              <td>Member</td>
              <td>Role</td>
          </tr>
          </thead>
          <tbody>

          {orgRefs.map(ref => (
              <tr key={ref.org_id}>
                  <td>{ref.org_name}</td>
                  <td>{ref.profile_name}</td>
                  <td>{ref.role}</td>
              </tr>))}
          </tbody>
      </table>
  </Box>);
};

export default OrgsList;