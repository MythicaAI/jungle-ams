import {Box, Typography, Input, Avatar, FormControl, FormLabel} from '@mui/joy';

const userProfile = {
  name: 'John Doe',
  description: 'Sample user profile',
  org: 'Org Name',
  profileImage: 'path/to/image.jpg',
  profileSignature: 'John Doe Signature',
  lastOnline: '2024-05-25',
  uploadCount: 5
};

const Settings = () => {
  return (
    <Box>
      <Typography level="h2">Settings</Typography>
      <Avatar src={userProfile.profileImage} alt="Profile Image" />
      <FormControl>
        <FormLabel>
          Name
        </FormLabel>
        <Input value={userProfile.name} />

      </FormControl>
      <FormControl>
        <FormLabel>
          Description
        </FormLabel>
        <Input value={userProfile.description} />

      </FormControl>
      <FormControl>
        <FormLabel>
          Organization
        </FormLabel>
        <Input value={userProfile.org} />

      </FormControl>
      <FormControl>
        <FormLabel>
          Profile Signature
        </FormLabel>
        <Input value={userProfile.profileSignature} />

      </FormControl>
      <FormControl>
        <FormLabel>
          Last Online
        </FormLabel>
        <Input value={userProfile.lastOnline} />

      </FormControl>
      <FormControl>
        <FormLabel>
          Upload Count
        </FormLabel>
        <Input value={userProfile.uploadCount} />

      </FormControl>
    </Box>
  );
};

export default Settings;