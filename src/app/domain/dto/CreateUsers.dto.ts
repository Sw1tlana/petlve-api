import { IsEmail, Length, IsString, IsPhoneNumber, IsOptional, IsArray } from "class-validator";
import { IUsers } from "../users/Users.types";
import { IPets } from "../pets/Pets.types";

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
  pets: IPets[];

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}

