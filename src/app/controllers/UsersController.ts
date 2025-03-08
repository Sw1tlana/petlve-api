import { JsonController, Get, Post, Body, Authorized } from "routing-controllers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "app/domain/models/User.model";
import { CreateUsers } from "../domain/dto/CreateUsers.dto";
import { ApiResponse } from "../../helpers/ApiResponse";
import { ApiError } from "../../helpers/ApiError";
import { validate } from "class-validator";
import { Notice } from "app/domain/models/Notices.model";

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
      jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY)
    }catch(error) {
      return new ApiError(401, { message: "Refresh token is invalid or expired" });
    }

    const decoded: any = jwt.decode(refreshToken);
    const { id } = decoded;

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

  @Get("/current") 
  @Authorized()
  async getCurrentUser(request: Request ) {
    try { 
      const authorizationHeader = request.headers['authorization'];

      if (!authorizationHeader) {
        return new ApiError(400, { message: "Token is required" });
      }
      
      const token = authorizationHeader.split(' ')[1];
      

      if (!token) {
        return new ApiError(400, { message: "Token is required" });
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.id) {
        return new ApiError(401, { message: "Invalid token" });
      }

      const user = await User.findById(decoded.id); 

      if (!user) {
        return new ApiError(404, { message: "User not found" });
      }

      const noticesFavorites = await Notice.find({ user: user._id });

      return new ApiResponse(true, {
        _id: user._id,
        name: user.name,
        email: user.email,
        token, 
        noticesFavorites
      });
      
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

