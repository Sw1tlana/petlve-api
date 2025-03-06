import { IsNumber, IsString  } from "class-validator";
import { INotices } from "../notices/Notices.types";

export class CreateNotices implements Omit<INotices, "id"> {

    @IsString()
    species: string;
  
    @IsString()
    category: string;
  
    @IsNumber()
    price: number;
  
    @IsString()
    title: string;
  
    @IsString()
    birthday: string;
  
    @IsString()
    comment: string;

    @IsString()
    name: string;
  
    @IsString()
    sex: string;
  
    @IsString()
    location: string;
  
    @IsString()
    imgURL: string;
  
    @IsString()
    createdAt: string;
  
    @IsString()
    user: string;
  
    @IsNumber()
    popularity: number;
  
    @IsString()
    updatedAt: string;

}