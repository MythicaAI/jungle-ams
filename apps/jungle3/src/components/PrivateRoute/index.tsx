import { useAuth0 } from "@auth0/auth0-react";
import * as React from "react";
import { Navigate, RouteProps } from "react-router-dom";

type Props = RouteProps & {
  component: React.ElementType;
};

export const PrivateRoute: React.FC<Props> = ({ component: Component }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return null;

  return isAuthenticated ? <Component /> : <Navigate to="/" replace />;
};
