import React, {useEffect, useState} from 'react';
import {Box, Typography, Input, Button, List, ListItem, FormControl, FormLabel, Textarea, Select} from '@mui/joy';
import {Text} from "lucide-react";
import {useGlobalStore} from "./stores/globalStore.ts";
import {ResolvedOrgRef} from "./types/apiTypes.ts";
import {getData} from "./services/backendCommon.ts";

const AssetEdit: React.FC = () => {
  const defaultOrgRefs: ResolvedOrgRef[] = [];
  const {assetCreation} = useGlobalStore();
  const [orgRefs, setOrgRefs] = useState<ResolvedOrgRef[]>(defaultOrgRefs);
  useEffect(() => {
    getData<ResolvedOrgRef[]>("orgs").then(data => {
      setOrgRefs(data)
    })
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    alert(JSON.stringify(formJson));
  }
  return (
      <Box className="full-size-box">
        <Typography gutterBottom>
          Create Asset
        </Typography>
        Asset ID: {assetCreation.asset_id}
        Collection ID: {assetCreation.collection_id}
        <form onSubmit={onSubmit}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

            <FormControl>
              <FormLabel>
                Name
              </FormLabel>
              <Input variant="outlined" defaultValue="Asset Name"/>

            </FormControl>
            <FormControl>
              <FormLabel>
                Namespace
              </FormLabel>
              <Select placeholder={"Choose an existing org..."}>
                {orgRefs.map(ref =>
                  <Option key={ref.org_id}>{ref.org_name}</Option>
                )}
              </Select>

            </FormControl>
            <FormControl>
              <FormLabel>
                Version
              </FormLabel>
              <Input variant="outlined" defaultValue="0.0.0"/>

            </FormControl>
            <FormControl>
              <FormLabel>
                Description
              </FormLabel>
              <Textarea variant="outlined" multiline="true" rows={4}></Textarea>

            </FormControl>
            <FormControl>
              <FormLabel>
                Images
              </FormLabel>
              <Input variant="outlined" fullWidth/>

            </FormControl>
            <FormControl>
              <FormLabel>
                Links
              </FormLabel>
              <Input variant="outlined" fullWidth/>

            </FormControl>

            <Box>
              <Typography level="title-md">References</Typography>
              <List>
                <ListItem>File B</ListItem>
                <ListItem>File C</ListItem>
              </List>
            </Box>
            <Button type="submit">Create</Button>

      </Box>
      </form>
</Box>
)
  ;
};

export default AssetEdit;