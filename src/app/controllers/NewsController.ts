import { News } from "../domain/models/News.model";
import { ApiError } from "../../helpers/ApiError";
import { ApiResponse } from "../../helpers/ApiResponse";
import { JsonController, Get } from "routing-controllers";

@JsonController("/news")
export class NewsController {
    @Get("/")
    async getFriends() {
        try {
            const news = await News.find().lean();
            return new ApiResponse(true, news);
        }catch(error) {
            return new ApiError(400, {message: "The list of news could not be retrieved. Please try again later."})
        }
    }
}