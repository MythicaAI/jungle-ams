import React, { PropsWithChildren } from 'react';
import { CircularProgress, Stack } from '@mui/joy';
import Cookies from 'universal-cookie';

const RequireAuth: React.FC<PropsWithChildren> = ({ children }) => {
  const cookies = new Cookies();
  const [isLoading, setIsLoading] = React.useState(true);
  let authToken: string | null = null;

  React.useEffect(() => {
    authToken = cookies.get('auth_token');
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    if (!authToken && !isLoading) {
      localStorage.setItem('awful_requires_token', 'true');
      window.location.pathname = '/';
    }
  }, [authToken, isLoading]);

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
      </Stack>
    );
  }

  if (!isLoading && !authToken) return null;

  return <>{children}</>;
};

export default RequireAuth;
