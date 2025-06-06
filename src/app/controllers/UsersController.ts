import { JsonController, 
        Get,
        Post, 
        Body, 
        Authorized, 
        CurrentUser, 
        Delete, 
        Param, 
        Patch, 
        UseBefore, 
        Req } from "routing-controllers";
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
import { MulterRequest, uploadAvatar, uploadPetPhoto } from "../middlewares/uploads";
import { IPets } from "app/domain/pets/Pets.types";
import { uploadImageFromPath } from '../../helpers/uploadImage';

const convertId = (id: any) => {
  if (id?.buffer?.data) {
    return new Types.ObjectId(Buffer.from(id.buffer.data)).toString();
  }
  return id?.toString() || null;
};

interface IUserUpdateBody {
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  avatar?: string;
};

interface IUserAddPetBody {
  name?: string;
  species?: string;
  title?: string;
  birthday?: string;
  photoUrl?: string;
  sex?: string;
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

      const token = jwt.sign({ id: body.email}, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const refreshToken = jwt.sign({ id: body.email},process.env.REFRESH_SECRET_KEY, {
        expiresIn: "7d",
      });

      const newUser = new User({ 
        ...body, 
        password: passwordHash, 
        token, 
        refreshToken 
      });
      await newUser.save();
      

      const savedUser = await newUser.save();
  
      return new ApiResponse(true, {
        message: "User successfully created",
        user: {
          ...savedUser!.toObject(),
          _id: convertId(savedUser!._id), 
        },
        token,
        refreshToken,
      });
    } catch (error) {
      return new ApiError(500, { message: "Validation failed" });
    }
  };


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
            name: user.name || null,
            email: user.email,
            avatar: user.avatar || null,
            phone: user.phone || null,
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
      .populate('pets') 
      .lean(); 

    if (!userFromDb) {
      return new ApiError(404, { message: "User not found in database" });
    }

const pets = userFromDb?.pets as unknown as IPets[];

return new ApiResponse(true, {
  _id: userFromDb._id.toString(),
  name: userFromDb.name,
  email: userFromDb.email,
  pets: pets.map(pet => ({
    _id: pet._id.toString(),
    species: pet.species,
    title: pet.title,
    name: pet.name,
    birthday: pet.birthday,
    sex: pet.sex,
    photo: pet.photo,
    owner: pet.owner.toString(),
  })),
  noticesFavorites: userFromDb.noticesFavorites,
});

  } catch (error) {
    return new ApiError(500, { message: "Internal server error" });
  }
};

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
};

@Patch("/current/edit")
@Authorized()
@UseBefore(uploadAvatar.single("avatar"))
async patchCurrentEdit(
  @CurrentUser() currentUser: IUsers,
  @Req() req: MulterRequest,
  @Body() body: IUserUpdateBody
) {
  try {
    const updateData: Record<string, any> = { ...body };

  if (req.file?.path) {
    const cloudinaryUrl = await uploadImageFromPath(req.file.path);
    updateData.avatar = cloudinaryUrl;

    import('fs').then(fs =>
      fs.unlink(req.file!.path, (err) => {
        if (err) console.error('Error deleting local file:', err);
      })
    );
      if (body.avatar?.trim()) {
        updateData.avatar = body.avatar.trim();
      }
  }

    const updatedUser = await User.findByIdAndUpdate(currentUser._id, updateData, { new: true });

    if (!updatedUser) {
      return new ApiError(404, { message: "User not found" });
    }

    const token = jwt.sign(
      { id: updatedUser._id.toString(), name: updatedUser.name },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: updatedUser._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: "3d" }
    );

    updatedUser.token = token;
    updatedUser.refreshToken = refreshToken;
    await updatedUser.save();

    return new ApiResponse(true, {
      message: "User updated successfully",
      user: {
        ...updatedUser.toObject(),
        _id: convertId(updatedUser._id),
        noticesFavorites: updatedUser.noticesFavorites.map(convertId),
        pets: updatedUser.pets.map(convertId),
        token,
        refreshToken
      }
    });

  } catch (error) {
    return new ApiError(500, { message: "Failed to update user" });
  }
};

@Post("/current/pets/add")
@Authorized()
@UseBefore(uploadPetPhoto.single("photo"))
async addCurrentPets(
  @CurrentUser() currentUser: IUsers,
  @Req() req: MulterRequest,
  @Body() body: IUserAddPetBody
) {
  try {
    const userId = currentUser?._id;

    if (!userId) {
      return new ApiError(400, { message: "User ID is missing" });
    }

    const updateData: Record<string, any> = {
      ...req.body, 
    };

    if (req.file?.path) {
      const cloudinaryUrl = await uploadImageFromPath(req.file.path);
      updateData.photo = cloudinaryUrl;

      import('fs').then(fs =>
        fs.unlink(req.file!.path, (err) => {
          if (err) console.error('Error deleting local file:', err);
        })
      );
    } else if (body.photoUrl?.trim()) {
      updateData.photo = body.photoUrl.trim();
    }

    if (!updateData.photo) {
      return new ApiError(400, { message: "Photo is required" });
    }

    if (updateData.birthday) {
      const now = new Date();
      const isoString = now.toISOString();
      updateData.birthday = now;
    }
  
    const newPet = new Pet({
      ...updateData,
      owner: userId,
    });

    await newPet.save();

    const savedPet = await Pet.findById(newPet._id).lean();

    if (!savedPet) {
      return new ApiError(404, { message: "Pet not found after save" });
    }

    await User.findByIdAndUpdate(userId, {
      $push: { pets: savedPet },
    });

    return new ApiResponse(true, {
      message: "Pet added successfully",
      data: {
        _id: convertId(savedPet._id),
        species: savedPet.species,
        title: savedPet.title,
        name: savedPet.name,
        birthday: savedPet.birthday,
        sex: savedPet.sex,
        photo: savedPet.photo,
        owner: convertId(savedPet.owner),
      },
    });

  } catch (error) {
    console.error("Add pet error:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return new ApiError(500, { message: "Internal server error" });
  }
};

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

