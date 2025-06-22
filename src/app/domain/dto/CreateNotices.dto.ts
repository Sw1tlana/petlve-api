import { IsDate, IsNumber, IsString  } from "class-validator";
import { INotices } from "../notices/Notices.types";

export class CreateNotices implements Omit<INotices, "_id"> {

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
  
    @IsDate() 
    createdAt: Date;
  
    @IsString()
    user: string;
  
    @IsNumber()
    popularity: number;
  
    @IsDate()
    updatedAt: Date;

}