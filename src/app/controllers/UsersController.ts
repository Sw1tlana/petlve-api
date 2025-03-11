import { JsonController, Get, Post, Body, Authorized, CurrentUser, Delete, Param, Patch } from "routing-controllers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Types } from "mongoose";

import { User } from "../domain/models/User.model";
import { CreateUsers } from "../domain/dto/CreateUsers.dto";
import { ApiResponse } from "../../helpers/ApiResponse";
import { ApiError } from "../../helpers/ApiError";
import { validate } from "class-validator";
import { IUsers } from "../domain/users/Users.types";
import { Pet } from "../domain/models/Pets.model";

const convertId = (id: any) => {
  if (id?.buffer?.data) {
    return new Types.ObjectId(Buffer.from(id.buffer.data)).toString();
  }
  return id?.toString() || null;
};

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
        user: {
          ...savedUser.toObject(),
          _id: convertId(savedUser._id)
        }
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
          _id: convertId(user._id),
          email: user.email,
        }
      });
    } catch (error) {
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
async getCurrentUser(@CurrentUser() currentUser: IUsers) {
  try { 

    if (!currentUser) {
      console.log("User not found");
      return new ApiError(404, { message: "User not found" });
    }

    const userFromDb = await User.findById(currentUser._id)
      .populate('noticesFavorites') 
      .lean(); 

    if (!userFromDb) {
      return new ApiError(404, { message: "User not found in database" });
    }

    return new ApiResponse(true, {
      _id: userFromDb._id.toString(),
      name: userFromDb.name,
      email: userFromDb.email,
      noticesFavorites: userFromDb.noticesFavorites, 
    });

  } catch (error) {
    return new ApiError(500, { message: "Internal server error" });
  }
}

@Get("/current/full") 
@Authorized()
async getCurrentFull(@CurrentUser() currentUser: IUsers) {
  const userWithDetails = await User.findById(currentUser._id)
    .populate("noticesViewed noticesFavorites pets")
    .lean();

  if (!userWithDetails) {
    throw new Error("User not found");
  }

  userWithDetails._id = convertId(userWithDetails._id);

  userWithDetails.pets = userWithDetails.pets.map((item: any) => ({
    ...item,
    _id: convertId(item._id),
    owner: item.owner ? convertId(item.owner) : null,
  }));

  return userWithDetails;
}

@Patch("/current/edit") 
@Authorized()
  async patchCurrentEdit(@CurrentUser() currentUser: IUsers,
  @Body() userData: { name?: string; email?: string; phone?: string; avatar?: string }
) {
try {
  const updatedUser = await User.findByIdAndUpdate(currentUser._id, userData, { new: true }).lean();

  if (!updatedUser) {
    return new ApiError(404, { message: "User not found" });
  }

  return new ApiResponse(true, { 
    message: "User updated successfully", 
    user: {
      ...updatedUser,
      _id: convertId(updatedUser._id),
      noticesFavorites: updatedUser.noticesFavorites.map(convertId),
      pets: updatedUser.pets.map(convertId)
    }
  });

} catch(error) {
  return new ApiError(500, { message: "Failed to update user" });
}
}

@Post("/current/pets/add")
@Authorized()
async addCurrentPets(
  @CurrentUser() currentUser: IUsers,
  @Body() body: { 
    species: string; 
    title: string; 
    name: string; 
    birthday: string; 
    sex: string; 
    imgURL: string;
  }
) {
  try {
    const { name, species, title, birthday, sex, imgURL } = body;
    const userId = currentUser?._id;

    if (!userId) {
      throw new ApiError(400, { message: "User ID is missing" });
    }

  
    const parsedBirthday = new Date(birthday);
    if (isNaN(parsedBirthday.getTime())) {
      throw new ApiError(400, { message: "Invalid birthday format" });
    }

    const newPet = new Pet({
      name,
      species,
      title,
      birthday: parsedBirthday,
      sex,
      imgURL,
      owner: userId,
    });

    await newPet.save().catch(err => {
      return new ApiError(500, { message: "Error saving pet" });
    });

    await User.findByIdAndUpdate(userId, { $push: { pets: newPet._id } });

    return new ApiResponse(true, { 
      message: "Pet added successfully", 
      data: {
        ...newPet.toObject(),
        _id: convertId(newPet._id),
        owner: convertId(newPet.owner)
      }
    });

  } catch (error) {
    throw new ApiError(500, { message: "Internal server error" });
  }
}

@Delete("/current/pets/remove/:id")
@Authorized()
async removeCurrentPets(
  @Param('id') id: string,
  @CurrentUser() user: IUsers,
) {
  try {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, { message: "Invalid ID format" });
    }

    const removePets = await Pet.findById(id).lean();
    
    if (!removePets) {
      throw new ApiError(404, { message: "Pet not found" });
    }

    const isPetInList = user.pets.some((pet) => pet.toString() === id);

    if (!isPetInList) {
      throw new ApiError(404, { message: "Pet not linked to user" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { pets: id } },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError(404, { message: "User not found or pet not linked" });
    }

    await Pet.findByIdAndDelete(id);

    return new ApiResponse(true, { 
      message: "Removed from pets", 
      data: {
        ...removePets,
        _id: convertId(removePets._id),
        owner: convertId(removePets.owner)
      }
    });

  } catch (error) {
    return new ApiError(500, { message: error.message || "Internal server error" });
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

