import {Box, Input, Avatar, FormControl, FormLabel, List, ListItem} from '@mui/joy';
import {ProfileResponse, ResolvedOrgRef} from "./types/apiTypes.ts";
import {useCookies} from "react-cookie";
import {useGlobalStore} from "./stores/globalStore.ts";
import {postData} from "./services/backendCommon.ts";
import {Profile} from "./schema_types/profiles.ts";
import {useState} from "react";
import {Form} from "react-router-dom";

const Settings = () => {
    const [cookies, ] = useCookies(['profile_id'])
    const [profileResponse, setProfileResponse] = useState<ProfileResponse>();
    const {profile, setProfile, orgRoles} = useGlobalStore();

    const onUpdateProfile = (formData) => {
        postData<ProfileResponse>(`profiles/${cookies.profile_id}`, formData).then(r =>
            {
                setProfileResponse(r)
                setProfile(r as Profile);
            });
    }

    const profileEdit = profile && <Form onSubmit={onUpdateProfile}>
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
          Organizations
        </FormLabel>
        <FormLabel>
            <List>
            {orgRoles.map(role => (
                <ListItem key={role.org_id}>
                    {role.org_name}
                </ListItem>)
            )}
            </List>
        </FormLabel>

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
    </Form>

    const profileLoading = <Box>
        Loading
    </Box>

  return (
      <div>
          {profile ? profileEdit : profileLoading}
      </div>);
};

export default Settings;