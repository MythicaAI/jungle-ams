import React, { PropsWithChildren } from 'react';
import { CircularProgress, Stack } from '@mui/joy';
import Cookies from 'universal-cookie';

const RequireAuth: React.FC<PropsWithChildren> = ({ children }) => {
  const cookies = new Cookies();
  const authToken = cookies.get('auth_token');

  React.useEffect(() => {
    if (!authToken) {
      localStorage.setItem('awful_requires_token', 'true');
      window.location.pathname = '/';
    }
  }, [authToken]);

  if (!authToken) {
    return (
      <Stack alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
      </Stack>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
