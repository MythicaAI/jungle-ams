// src/users/profilesService.ts
import { Profile } from "../models";

// A post request should not contain an id.
export type ProfileCreationParams = Pick<Profile, "id" | "name" | "tags">;

export class ProfilesService {
  public get(id: string, name?: string): Profile {
    return {
      id,
      name: name ?? "Jane Doe",
      created: new Date(),
      updated: new Date(),
      active: false,
      tags: {},
      base_href: "https://foo",
      description: "",
      email_verified: false,
      location: "jane@doe.com",
      login_count: 0,
    };
  }

  public create(params: ProfileCreationParams): Profile {
    return {
      ...params,
      created: new Date(),
      updated: new Date(),
      active: false,
      base_href: "https://foo",
      description: "",
      email_verified: false,
      location: "jane@doe.com",
      login_count: 0,
    };
  }
}
