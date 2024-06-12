import {Box, Typography, Input, Button, List, ListItem, FormControl, FormLabel, Select, Option} from '@mui/joy';
import Textarea from '@mui/joy/Textarea';
import {useGlobalStore} from "./stores/globalStore.ts";

const AssetEdit: React.FC = () => {
  const {assetCreation, orgRoles} = useGlobalStore();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
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
                {orgRoles.map(role =>(
                  <Option key={role.org_id} value={role.org_id}>
                    {role.org_name}
                  </Option>)
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
              <Textarea
                  placeholder="Fill out a description..."
                  variant="outlined"
                  size="md"
                  minRows={4}>
              </Textarea>

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