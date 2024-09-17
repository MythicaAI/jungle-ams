// src/controllers/profilesController.ts
import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
} from "tsoa";
import { Profile } from "../models";
import { ProfilesService, ProfileCreationParams } from "../services/profilesService";

@Route("profiles")
export class ProfilesController extends Controller {
  @Get("{profileId}")
  public async getProfile(
    @Path() profileId: string,
    @Query() name?: string
  ): Promise<Profile> {
    return new ProfilesService().get(profileId, name);
  }

  @SuccessResponse("201", "Created") // Custom success response
  @Post()
  public async createProfile(
    @Body() requestBody: ProfileCreationParams
  ): Promise<void> {
    this.setStatus(201); // set return status 201
    new ProfilesService().create(requestBody);
    return;
  }
}
