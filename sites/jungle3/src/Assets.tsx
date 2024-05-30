import { Box, Typography, List, ListItem } from '@mui/joy';

const assets = [
  { id: 1, name: 'Asset 1' },
  { id: 2, name: 'Asset 2' },
  { id: 3, name: 'Asset 3' }
];

const Assets = () => {
  return (
    <Box>
      <Typography level="h2">Assets</Typography>
      <List>
        {assets.map(asset => (
          <ListItem key={asset.id}>
            {asset.name}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Assets;