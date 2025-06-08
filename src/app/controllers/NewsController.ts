import { News } from "../domain/models/News.model";
import { ApiError } from "../../helpers/ApiError";
import { ApiResponse } from "../../helpers/ApiResponse";
import { JsonController, Get, QueryParams } from "routing-controllers";

@JsonController("/news")
export class NewsController {
    @Get("/")
    async getFriends(@QueryParams() queryParams: any) {
        try {
            let { page = 1, limit = 6 } = queryParams;

            page = parseInt(page);
            limit = parseInt(limit);

            const skip = (page - 1) * limit;

            const news = await News.find()
                .skip(skip)
                .limit(limit)
                .lean();

                const total = await News.countDocuments();

                const transformed = news.map((item: any) => ({
                    ...item,
                    _id: item._id?.toString?.(),
                }));

            return new ApiResponse(true, {
                data: transformed,
                    pagination: {
                    total: total,
                    page: page,
                    limit: limit,
                    pages: Math.ceil(total / limit),
                    },
            });
        }catch(error) {
            return new ApiError(400, {message: "The list of news could not be retrieved. Please try again later."})
        }
    }
}