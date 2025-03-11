import { Notice } from "../domain/models/Notices.model";
import { User } from "../domain/models/User.model";
import { IUsers } from "../domain/users/Users.types";
import { ApiError } from "../../helpers/ApiError";
import { ApiResponse } from "../../helpers/ApiResponse";
import mongoose from "mongoose";
import { JsonController, Get, Post, Param, Delete, Authorized, CurrentUser } from "routing-controllers";

@JsonController("/notices")
export class NoticesController {
    @Get("/")
    async getNotices() {
        try {
        const notices = await Notice.find().lean();
        return new ApiResponse(true, notices);
        }catch(error) {
            return new ApiError(400, { message: "Validation failed"});
        }
}

@Get("/categories")
async getCategories() {
    try {
        const categories = await Notice.distinct("category");
        
        return new ApiResponse(true, categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return new ApiError(500, { message: error.message || "Internal Server Error" });
    }
}

@Get("/sex")
async getSex() {
    try {
        const notices = await Notice.distinct("sex");
        
        if (!notices || notices.length === 0) {
            return new ApiError(404, { message: "No notices found" });
        }

        return new ApiResponse(true, notices);
    }catch(error) {
        console.error("Error fetching sex notices:", error); 
        return new ApiError(400, { message: "Validation failed"});
    }
}

@Get("/species")
async getSpecies() {
    try {
        const species = await Notice.distinct("species");
        return new ApiResponse(true, species);
    }catch(error) {
        return new ApiError(400, { message: "Validation failed"});
    }
}

    @Get("/:id")
    async getNoticesById(@Param('id') id: string) {
  try {
   const notice = await Notice.findOne({ _id: id }).lean();

    if (!notice) {
        return new ApiError(404, { message: "Notice not found" });
    }

      return new ApiResponse(true, { data: notice });

  } catch (error) {
      return new ApiError(500, { message: "Internal server error" });
  }
}

@Post("/favorites/add/:id")
    @Authorized() 
    async addNoticeFavorites(@Param('id') id: string,
    @CurrentUser() user: IUsers) {

  try {
   const favorite = await Notice.findById(id).lean();

    if (!favorite) {
        return new ApiError(404, { message: "Notice not found" });
    }

    const isAlreadyFavorite = user.noticesFavorites.some(
        (favId) => favId.toString() === id
      );
  
      if (isAlreadyFavorite) {
        return new ApiResponse(true, { message: "Already in favorites" });
      }

      await User.findByIdAndUpdate(user._id, {
        $push: { noticesFavorites: id },
      });
  

      return new ApiResponse(true, { message: "Added to favorites",  favorite });

  } catch (error) {
      return new ApiError(500, { message: "Internal server error" });
  }
}

@Delete("/favorites/remove/:id")
    async deleteNoticeFavorites(@Param('id') id: string,
    @CurrentUser() user: IUsers) {
  try {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return new ApiError(400, { message: "Invalid ID format" });
      }

    const isFavorite = user.noticesFavorites.some((favId) => favId.toString() === id);

        if (!isFavorite) {
        return new ApiError(404, { message: "Notice not in favorites" });
  }

        await User.findByIdAndUpdate(user._id, {
            $pull: { noticesFavorites: id }
        });

        const removeFavorite = await Notice.findById(id).lean();

        if (!removeFavorite) {
            return new ApiError(404, { message: "Notice not found" });
          }

      return new ApiResponse(true, { message: "Removed from favorites", data: removeFavorite });

  } catch (error) {
      return new ApiError(500, { message: "Internal server error" });
  }
}

}
