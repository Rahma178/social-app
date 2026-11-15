
import type { Model } from "mongoose";
import userModel, {  type IUser } from "../models/user.model";
import { DBRepository } from "./db.repository.js";

export class UserRepository extends DBRepository<IUser> {

  constructor(public readonly model: Model<IUser> = userModel) {
    super(model);
  }

  async createUser(data: Partial<IUser>) {
    return await this.model.create(data);
  }
}