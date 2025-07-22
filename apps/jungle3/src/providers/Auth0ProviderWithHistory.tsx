import { AppState, Auth0Provider, User } from "@auth0/auth0-react";

interface Auth0ProviderWithConfigProps {
  children: React.ReactNode;
}

const Auth0ProviderWithHistory: React.FC<Auth0ProviderWithConfigProps> = ({
  children,
}) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  const redirectHandler = (appState?: AppState, userState?: User) => {
    console.log(appState);
    console.log(userState);

    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname,
    );
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      onRedirectCallback={redirectHandler}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "openid profile email",
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
