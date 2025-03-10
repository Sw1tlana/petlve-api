import { IsEmail, Length, IsString, IsPhoneNumber, IsOptional, IsArray } from "class-validator";
import { IUsers } from "../users/Users.types";
import { Types } from "mongoose";

export class CreateUsers implements Omit<IUsers, "_id" | "noticesFavorites"> {
  @Length(2, 20)
  name: string;

  @IsEmail()
  @Length(7, 20)
  email: string;
  
  @IsString() 
  @IsPhoneNumber("UA")
  phone: string;

  @IsString()
  @Length(7, 20)
  password: string;

  @IsArray()
  @IsOptional() 
  pets: Types.ObjectId[] = [];
}

