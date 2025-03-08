import { Citie } from "../domain/models/Cities.model";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import { JsonController, Get } from "routing-controllers";

@JsonController("/cities")
export class CitiesController {
    @Get("/")
    async getFriends() {
        try {
            const cities = await Citie.find().lean();
            return new ApiResponse(true, cities);
        }catch(error) {
            return new ApiError(400, {message: "The list of cities could not be retrieved. Please try again later."})
        }
    }
}