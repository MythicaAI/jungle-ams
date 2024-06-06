import React from 'react';
import {Box, Typography, Input, Button, List, ListItem, Sheet, FormControl, FormLabel, Textarea} from '@mui/joy';
import {Text} from "lucide-react";

const AssetEdit: React.FC = () => {
  return (
    <div className="outer-container">
      <Box className="full-size-box">
        <Sheet elevation={3} className="full-size-box">
          <Typography variant="h4" gutterBottom>
            Single Asset View
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl>
              <FormLabel>
                Name
              </FormLabel>
              <Input variant="outlined" />

            </FormControl>
            <FormControl>
              <FormLabel>
                Description
              </FormLabel>
              <Textarea variant="outlined" multiline="true" rows={4} />

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
              <Typography variant="h6">Files List</Typography>
              <Button variant="contained" component="label">
                Upload
                <input type="file" hidden />
              </Button>
            </Box>

            <Box>
              <Typography variant="h6">References</Typography>
              <List>
                <ListItem>
                  <Text primary="FileA -> FileB" />
                </ListItem>
                {/* Additional references can be added here */}
                <Button variant="contained">+</Button>
              </List>
            </Box>
          </Box>
        </Sheet>
      </Box>
    </div>
  );
};

export default AssetEdit;