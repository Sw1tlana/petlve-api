import { JsonController, Get, Post, Body, Authorized, CurrentUser } from "routing-controllers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "app/domain/models/User.model";
import { CreateUsers } from "../domain/dto/CreateUsers.dto";
import { ApiResponse } from "../../helpers/ApiResponse";
import { ApiError } from "../../helpers/ApiError";
import { validate } from "class-validator";
import { Notice } from "app/domain/models/Notices.model";
import { IUsers } from "app/domain/users/Users.types";

@JsonController("/users")
export class UsersController {
  @Post("/signup")
  async setUsers(@Body() body: CreateUsers) {
    try {
     
      const errors = await validate(body);
      if (errors.length > 0) {
        return new ApiError(400, { message: "Validation failed", errors });
      }
      const passwordHash = await bcrypt.hash(body.password, 10);

      const newUser = new User({ ...body, password: passwordHash });
      const savedUser = await newUser.save();

      return new ApiResponse(true, { 
        message: "User successfully created", 
        user: savedUser.toObject() 
    });

    } catch (error) {
      return new ApiError(500, { message: "Validation failed" });
    }
  }


  @Post("/signin")
  async signIn(@Body() body: { email: string; password: string }) {
    try {
      const { email, password } = body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return new ApiError(401, { message: "Invalid credentials" });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return new ApiError(401, { message: "Invalid credentials" });
      }

      const payload = {
        id: user._id,
    }

      const token = jwt.sign({ id: user._id, name: user.name }, 
        process.env.JWT_SECRET, 
        { expiresIn: "1h" }
      );
      const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: "30d" });

      await User.findByIdAndUpdate(user._id, { token, refreshToken }, { new: true });
      console.log("Updated User Token:", token);
  
      return new ApiResponse(true, { 
        message: "Login successful", 
        token, 
        refreshToken,
        user: {
          _id: user._id,
          email: user.email,
        }
      });
    } catch (error) {
      console.error("Error in signIn:", error);
      return new ApiError(500, { message: "Internal server error" });
    }
  }

  @Post("/refresh-tokens")
  async refreshTokens(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;

    if (!refreshToken) {
      return new ApiError(400, { message: "Refresh token is required" });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
      const { id } = decoded as { id: string }; 
      const user = await User.findById(id);

    if (!user) {
      return new ApiError(404, { message: "User not found" });
  }

  const payload = { id: user._id };
  const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  const newRefreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: "30d" });

  await User.findByIdAndUpdate(user._id, { token: newToken, refreshToken: newRefreshToken });

  return new ApiResponse(true, { 
    token: newToken,
    refreshToken: newRefreshToken 
});
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    return new ApiError(401, { message: "Refresh token is expired" });
  } else {
    return new ApiError(401, { message: "Refresh token is invalid" });
  }
}
}

@Get("/current") 
@Authorized()
async getCurrentUser(@CurrentUser() user: IUsers) {
  try { 
    console.log("Current user from request:", user);
    if (!user) {
      console.log("User not found");
      return new ApiError(404, { message: "User not found" });
    }

    const noticesFavorites = await Notice.find({ user: user._id }).exec();

    return new ApiResponse(true, {
      _id: user._id,
      name: user.name,
      email: user.email,
      noticesFavorites
    });

  } catch (error) {
    console.error("Internal server error:", error);
    return new ApiError(500, { message: "Internal server error" });
  }
}

  @Post("/signout") 
  async signOut(@Body() body: { userId: string }) {
    try {
      await User.findByIdAndUpdate(body.userId, { token: null }, {new: true});

      return new ApiResponse(true, { message: "User logged out successfully" });

    }catch(error) {
      return new ApiError(500, { message: "Internal server error" });
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

