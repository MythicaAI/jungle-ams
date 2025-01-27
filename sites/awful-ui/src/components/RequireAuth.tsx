import React, { PropsWithChildren } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { CircularProgress, Stack } from '@mui/joy';

const RequireAuth: React.FC<PropsWithChildren> = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();

  console.info('user: ', user);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
      </Stack>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
