import { IsEmail, Length, IsInt, Min, Max, IsString, IsPhoneNumber } from "class-validator";
import { IUsers } from "../users/Users.types";

export class CreateUsers implements Omit<IUsers, "id"> {
  @Length(2, 20)
  name: string;

  @IsEmail()
  email: string;
  
  @IsString() 
  @IsPhoneNumber("UA")
  phone: string;

  @IsString()
  @Length(6, 50)
  password: string;
}
