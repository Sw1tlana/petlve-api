import { Notice } from "app/domain/models/Notices.model";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import { JsonController, Get, Post, Body, Authorized, Param, QueryParam } from "routing-controllers";

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

@Get("/:id")
async getNotiesById(@Param('id') id: string) {
    try {
      const notice = await Notice.findById(id);

      if (!notice) {
        return new ApiError(400, {message: 'Notice not found'});
      }
      return new ApiResponse(true, { success: true, data: notice });
    }catch(error) {
        return new ApiError(400, { message: 'Error fetching notice' });
    }
}

@Get("/categories")
async getCategories() {
    try {
        const categories = await Notice.distinct("category").lean();
        return new ApiResponse(true, categories);
    }catch(error) {
        return new ApiError(400, { message: "Validation failed"});
    }
}

@Get("/sex")
async getSex() {
    try {
        const notices = await Notice.distinct("sex").lean();
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

}
