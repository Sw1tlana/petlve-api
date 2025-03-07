import { Notice } from "app/domain/models/Notices.model";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import { JsonController, Get, Post, Param, Delete } from "routing-controllers";

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
async addNoticeFavorites(@Param('id') id: string) {
  try {
   const favorite = await Notice.findOne({ _id: id }).lean();

    if (!favorite) {
        return new ApiError(404, { message: "Notice not found" });
    }

      return new ApiResponse(true, { data: favorite });

  } catch (error) {
      return new ApiError(500, { message: "Internal server error" });
  }
}

@Delete("/favorites/remove/:id")
async deleteNoticeFavorites(@Param('id') id: string) {
  try {
   const removeFavorite = await Notice.findOne({ _id: id }).lean();

    if (!removeFavorite) {
        return new ApiError(404, { message: "Notice not found" });
    }

      return new ApiResponse(true, { data: removeFavorite });

  } catch (error) {
      return new ApiError(500, { message: "Internal server error" });
  }
}

}
