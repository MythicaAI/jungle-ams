import React from 'react';
import {Box, Typography, Input, Button, List, ListItem, FormControl, FormLabel, Textarea} from '@mui/joy';
import {Text} from "lucide-react";
import {useGlobalStore} from "./stores/globalStore.ts";

const AssetEdit: React.FC = () => {
  const {assetCreation} = useGlobalStore();

  return (
      <Box className="full-size-box">
        <Typography gutterBottom>
          Create Asset
        </Typography>
        Asset ID: {assetCreation.asset_id}
        Collection ID: {assetCreation.collection_id}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl>
            <FormLabel>
              Name
            </FormLabel>
            <Input variant="outlined" defaultValue="Asset Name" />

          </FormControl>
          <FormControl>
            <FormLabel>
              Collection
            </FormLabel>
            <Input variant="outlined" defaultValue="Choose a collection/namespace" />

          </FormControl>
          <FormControl>
            <FormLabel>
              Version
            </FormLabel>
            <Input variant="outlined" defaultValue="0.0.0" />

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
            <Input variant="outlined" fullWidth />

          </FormControl>
          <FormControl>
            <FormLabel>
              Links
            </FormLabel>
            <Input variant="outlined" fullWidth />

          </FormControl>

          <Box>
            <Typography level="title-md">References</Typography>
            <List>
              <ListItem>File B</ListItem>
              <ListItem>File C</ListItem>
            </List>
          </Box>
        </Box>
      </Box>
  );
};

export default AssetEdit;