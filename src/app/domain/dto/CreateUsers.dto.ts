import { IsEmail, Length, IsString, IsPhoneNumber } from "class-validator";
import { IUsers } from "../users/Users.types";

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
}
