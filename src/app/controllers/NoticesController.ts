import { Notice } from "../domain/models/Notices.model";
import { User } from "../domain/models/User.model";
import { IUsers } from "../domain/users/Users.types";
import { ApiError } from "../../helpers/ApiError";
import { ApiResponse } from "../../helpers/ApiResponse";
import mongoose from "mongoose";
import { JsonController, Get, Post, Param, Delete, Authorized, CurrentUser, QueryParams } from "routing-controllers";
import { Types } from "mongoose";

const convertId = (id: any) => {
  if (id?.buffer?.data) {
    return new Types.ObjectId(Buffer.from(id.buffer.data)).toString();
  }
  return id?.toString() || null;
};

@JsonController("/notices")
export class NoticesController {
    @Get("/")
    async getNotices(@QueryParams() queryParams: any) {
        try {
          let { page = 1, limit = 6 } = queryParams;

            page = parseInt(page);
            limit = parseInt(limit);

            const skip = (page - 1) * limit;

        const notices = await Notice.find()
                .skip(skip)
                .limit(limit)
                .lean();

    const total = await Notice.countDocuments();
        
    const transformed = notices.map((notice) => ({
      ...notice,
      _id: notice._id?.toString?.(),
      user: notice.user?.toString?.(),
      location: notice.location?.toString?.(), 
    }));
    
        return new ApiResponse(true, {
        data: transformed,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
        }catch(error) {
          return new ApiError(400, { message: "Validation failed"});
        }
};

@Get("/categories")
async getCategories() {
    try {
        const categories = await Notice.distinct("category");
        
        return new ApiResponse(true, categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return new ApiError(500, { message: error.message || "Internal Server Error" });
    }
};

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
};

@Get("/species")
async getSpecies() {
    try {
        const species = await Notice.distinct("species");
        return new ApiResponse(true, species);
    }catch(error) {
        return new ApiError(400, { message: "Validation failed"});
    }
};

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
};

@Post("/favorites/add/:id")
@Authorized() 
async addNoticeFavorites(
  @Param('id') id: string,
  @CurrentUser() user: IUsers
) {
  try {
    const favorite = await Notice.findById(id).lean();

      if (!favorite) {
        return new ApiError(404, { message: "Notice not found" });
      }

      const isAlreadyFavorite = user.noticesFavorites.some(
        (fav: any) => fav._id?.toString() === id
      );

      if (isAlreadyFavorite) {
        return new ApiResponse(true, { message: "Already in favorites" });
      }

      const noticeSnapshot = {
        _id: convertId(favorite._id),
        species: favorite.species,
        category: favorite.category,
        price: favorite.price,
        title: favorite.title,
        name: favorite.name,
        birthday: favorite.birthday,
        comment: favorite.comment,
        sex: favorite.sex,
        location: favorite.location,
        imgURL: favorite.imgURL,
        createdAt: favorite.createdAt,
        user: favorite.user?.toString(),
        popularity: favorite.popularity,
      };

      await User.findByIdAndUpdate(user._id, {
        $push: { noticesFavorites: noticeSnapshot },
      });

      const userFromDb = await User.findById(user._id).lean();

      if (!userFromDb) {
        return new ApiError(404, { message: "Користувача не знайдено" });
      }

    const normalizeFavorites = (favorites: any[]) =>
      favorites
        .map((fav: any) => {
          fav._id = convertId(fav._id);
          fav.user = convertId(fav.user);
          return fav;
        })
        .filter((fav: any) => typeof fav._id === 'string');

      return new ApiResponse(true, {
        _id: convertId(userFromDb._id),
        name: userFromDb.name,
        email: userFromDb.email,
        noticesFavorites: normalizeFavorites(userFromDb.noticesFavorites),
      });

      } catch (error) {
        return new ApiError(500, { message: "Internal server error" });
      }
    };

    @Delete("/favorites/remove/:id")
    @Authorized()
    async deleteNoticeFavorites(
      @Param('id') rawId: any,
      @CurrentUser() user: IUsers
    ) {
        try {
      const id = mongoose.Types.ObjectId.isValid(rawId)
        ? new mongoose.Types.ObjectId(rawId).toString()
        : null;

      if (!id) {
        return new ApiError(400, { message: "Некоректний формат ID" });
      }

      const isFavorite = user.noticesFavorites.some(
        (fav: any) => convertId(fav._id) === id
      );

      if (!isFavorite) {
        return new ApiError(404, { message: "Оголошення не в обраних" });
      }

      await User.findByIdAndUpdate(user._id, {
        $pull: { noticesFavorites: { _id: new mongoose.Types.ObjectId(id) } },
      });

      const removedNotice = await Notice.findById(id).lean();

      if (!removedNotice) {
        return new ApiError(404, { message: "Оголошення не знайдено" });
      }

      return new ApiResponse(true, {
        message: "Успішно видалено з обраного",
        data: {
          ...removedNotice,
          _id: convertId(removedNotice._id),
          user: convertId(removedNotice.user),
        },
      });
    } catch (error) {
    return new ApiError(500, { message: "Internal server error" });
  }
};
};
