import { IsString } from "class-validator";
import { ICities } from "../../domain/cities/Cities.types";

export class CreateCities implements Omit<ICities, "id"> {
  
  @IsString()
  useCounty: string;

  @IsString()
  stateEn: string;

  @IsString()
  cityEn: string;

  @IsString()
  countyEn: string;
}