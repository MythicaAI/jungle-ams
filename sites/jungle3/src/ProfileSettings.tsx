import {Box, Input, Avatar, FormControl, FormLabel} from '@mui/joy';
import {useEffect, useState} from "react";
import {getData} from "./services/backendCommon.ts";
import {ProfileResponse} from "./types/apiTypes.ts";
import {useCookies} from "react-cookie";

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
    const [cookies, ] = useCookies(['user'])
    const [profile, setProfile] = useState<ProfileResponse>();
    useEffect(() => {
        getData<ProfileResponse>(`profiles/${cookies.user}`).then(r => {
                setProfile(r);
            }
        )
    }, [cookies])

    const profileEdit = profile && <Box>
        <Avatar src={userProfile.profileImage} alt="Profile Image" />
      <FormControl>
        <FormLabel>
          Name
        </FormLabel>
        <Input value={profile.name} />

      </FormControl>
      <FormControl>
        <FormLabel>
          Description
        </FormLabel>
        <Input value={profile.description} />

      </FormControl>
      <FormControl>
        <FormLabel>
          Organization
        </FormLabel>
        <Input value={profile.org} />

      </FormControl>
      <FormControl>
        <FormLabel>
          Profile Signature
        </FormLabel>
        <Input value={profile.signature} />

      </FormControl>
      <FormControl>
        <FormLabel>
          Last Online
        </FormLabel>
        <Input value={profile.updated} />

      </FormControl>
    </Box>

    const profileLoading = <Box>
        Loading
    </Box>

  return (
      <div>
          {profile ? profileEdit : profileLoading}
      </div>);
};

export default Settings;