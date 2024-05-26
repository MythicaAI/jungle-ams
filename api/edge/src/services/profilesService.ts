// src/users/profilesService.ts
import { Profile } from "../models";

// A post request should not contain an id.
export type ProfileCreationParams = Pick<Profile, "email" | "name" | "phoneNumbers">;

export class ProfilesService {
  public get(id: str, name?: string): Profile {
    return {
      id,
      email: "jane@doe.com",
      name: name ?? "Jane Doe",
      status: "Happy",
      phoneNumbers: [],
    };
  }

  public create(params: ProfileCreationParams): Profile {
    return {
      id: "", // Random
      ...params,
    };
  }
}
