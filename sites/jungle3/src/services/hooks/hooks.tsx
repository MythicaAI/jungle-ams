import { SessionStartResponse } from "../../types/apiTypes";
import { Auth } from "./services";

export const useAuthenticationActions = () => {
  const login = async (username: string) =>
    new Promise<SessionStartResponse>((resolve, reject) => {
      Auth.get({
        path: `/profiles/start_session/${username}`,
      })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });

  return { login };
};
