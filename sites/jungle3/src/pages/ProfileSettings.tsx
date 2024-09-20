import {
  Box,
  Input,
  FormControl,
  FormLabel,
  List,
  ListItem,
  Button,
  Card,
  Typography,
  CardContent,
} from "@mui/joy";
import { ProfileResponse } from "types/apiTypes";
import { useCookies } from "react-cookie";
import { useGlobalStore } from "@store/globalStore";
import {
  extractValidationErrors,
  translateError,
} from "@services/backendCommon";
import { FormEvent } from "react";
import { Form, Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";
import { MailCheckIcon, Tag } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useStatusStore } from "@store/statusStore";
import { api } from "@services/api";

interface ValidateEmailResponse {
  profile_id: string;
  code: string;
  link: string;
  state: string;
}

const ProfileSettings = () => {
  const [cookies] = useCookies(["profile_id"]);
  const { profile, setProfile, updateProfile, orgRoles } = useGlobalStore();
  const [searchParams] = useSearchParams();
  const isCreate = searchParams.has("create");
  const { setSuccess, addError, addWarning } = useStatusStore();

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  const onUpdateProfile = (event: FormEvent) => {
    event.preventDefault();
    if (event.currentTarget) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    api
      .post<ProfileResponse>({
        path: `/profiles/${cookies.profile_id}`,
        body: formJson,
      })
      .then((r) => {
        setProfile(r as unknown as ProfileResponse);
        setSuccess("Profile updated");
        cookies.profile_id = r.profile_id;
      })
      .catch((err) => handleError(err));
  };

  const onCreateProfile = (event: FormEvent) => {
    event.preventDefault();
    if (!event.currentTarget) {
      return;
    }
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const formJson = Object.fromEntries(formData.entries());
    api
      .post<ProfileResponse>({ path: `/profiles/`, body: formJson })
      .then((r) => {
        setProfile(r as unknown as ProfileResponse);
        setSuccess(`Profile created ${r.profile_id}`);
        cookies.profile_id = r.profile_id;
      })
      .catch((err) => handleError(err));
  };

  const onRequestEmailVerification = () => {
    api
      .get<ValidateEmailResponse>({ path: "/validate-email" })
      .then((r) => {
        setSuccess(
          `Email verification requested Debug: ${r.profile_id} ${r.link}`,
        );
      })
      .catch((err) => handleError(err));
  };

  const profileName = (
    <FormControl>
      <FormLabel>Name</FormLabel>
      <Input
        name="name"
        required
        value={profile.name}
        onChange={(e) => updateProfile({ name: e.target.value })}
      />
    </FormControl>
  );

  const profileFullName = (
    <FormControl>
      <FormLabel>Full Name</FormLabel>
      <Input
        name="full_name"
        value={profile.full_name}
        onChange={(e) => updateProfile({ full_name: e.target.value })}
      />
    </FormControl>
  );

  const verifiedLabel = profile.email_verified ? (
    <Tag color="success" />
  ) : (
    <Button onClick={onRequestEmailVerification}>
      <MailCheckIcon />
    </Button>
  );

  const profileEmailValidate = (
    <FormControl>
      <FormLabel>Email</FormLabel>

      <Input
        name="email"
        required
        disabled={isCreate}
        value={profile.email}
        onChange={(e) => updateProfile({ email: e.target.value })}
        endDecorator={verifiedLabel}
      />
      <Box>Email Validation State: {profile.email_verified}</Box>
    </FormControl>
  );

  const profileEmailCreate = (
    <FormControl>
      <FormLabel>Email</FormLabel>

      <Input
        name="email"
        required
        value={profile.email}
        onChange={(e) => updateProfile({ email: e.target.value })}
      />
    </FormControl>
  );

  const profileDescription = (
    <FormControl>
      <FormLabel>Description</FormLabel>
      <Input
        name="description"
        value={profile.description}
        onChange={(e) => updateProfile({ description: e.target.value })}
      />
    </FormControl>
  );

  const profileOrgs = (
    <FormControl>
      <Card
        variant="outlined"
        sx={{
          minHeight: "280px",
          width: 320,
        }}
      >
        <Typography level="h2" fontSize="lg">
          Organizations
        </Typography>
        <CardContent>
          <List>
            {orgRoles.map((role) => (
              <ListItem key={role.org_id}>{role.org_name}</ListItem>
            ))}
          </List>
          <Link to="/orgs">Edit</Link>
        </CardContent>
      </Card>
    </FormControl>
  );

  const profileEdit = profile && (
    <Form onSubmit={onUpdateProfile}>
      {profileName}
      {profileFullName}
      {profileDescription}
      {profileEmailValidate}
      {profileOrgs}
    </Form>
  );

  const profileCreate = (
    <Form onSubmit={onCreateProfile}>
      {profileName}
      {profileFullName}
      {profileDescription}
      {profileEmailCreate}
      <Button type="submit">Create</Button>
    </Form>
  );

  const profileLoading = <Box>Loading</Box>;

  console.log("isCreate: ", isCreate);

  return (
    <div>
      <Helmet>
        <title>Mythica • My Profile</title>
      </Helmet>
      {isCreate ? profileCreate : profile ? profileEdit : profileLoading}
    </div>
  );
};

export default ProfileSettings;
