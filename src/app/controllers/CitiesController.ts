import { City } from "../domain/models/Cities.model";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import { JsonController, Get, Param, QueryParam } from "routing-controllers";

@JsonController("/cities")
export class CitiesController {
    @Get("/")
    async getFriends(@QueryParam("keyword") keyword: string) {
        try {
            if (keyword && (keyword.length < 3 || keyword.length > 48)) {
                return new ApiError(400, { message: "The keyword length must be between 3 and 48 characters." });
            }

            const cities = await City.find({ cityEn: new RegExp(keyword, "i") }).lean();
            
            if (cities.length > 0) {
                return new ApiResponse(true, cities);
            } else {
                return new ApiError(404, { message: `No cities found for keyword: ${keyword}` });
            }
        }catch(error) {
            return new ApiError(400, {message: "The list of cities could not be retrieved. Please try again later."})
        }
    }

    @Get("/location/:location")
    async getCityByLocation(@Param("location") location: string) {
        try {
            const city = await City.findOne({ cityEn: new RegExp(`^${location}$`, "i") }).lean();
        
            if (!city) {
                return new ApiError(404, { message: `City with name ${location} not found.` });
            }

            return new ApiResponse(true, city);
        } catch (error) {
            return new ApiError(400, { message: "Could not retrieve city by location. Please try again later." });
        }
    }

}