import { Friend } from "../domain/models/Friends.model";
import { ApiError } from "../../helpers/ApiError";
import { ApiResponse } from "../../helpers/ApiResponse";
import { JsonController, Get } from "routing-controllers";

@JsonController("/friends")
export class FriendsController {
    @Get("/")
    async getFriends() {
        try {
            const friends = await Friend.find().lean();
            return new ApiResponse(true, friends);
        }catch(error) {
            return new ApiError(400, {message: "The list of friends could not be retrieved. Please try again later."})
        }
    }
}