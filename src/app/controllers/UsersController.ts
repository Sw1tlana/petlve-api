import { JsonController, Get, Post, Body } from "routing-controllers";
import { User } from "app/domain/models/User.model";
import { CreateUsers } from "../domain/dto/CreateUsers.dto";
import { ApiResponse } from "../../helpers/ApiResponse";
import { ApiError } from "../../helpers/ApiError";
import { validate } from "class-validator";

@JsonController("/users")
export class UsersController {
  @Post()
  async setUsers(@Body() body: CreateUsers) {
    try {
     
      const errors = await validate(body);
      if (errors.length > 0) {
        return new ApiError(400, { message: "Validation failed", errors });
      }

      const newUser = new User(body);
      await newUser.save();
      return new ApiResponse(true, "User successfully created");
    } catch (error) {
      return new ApiError(500, { message: "Validation failed" });
    }
  }

  @Get()
  async getUsers() {
    try {
      const users = await User.find();
      return new ApiResponse(true, users);
    } catch (error) {
      return new ApiError(500, { message: "Failed to fetch users" });
    }
  }
}
