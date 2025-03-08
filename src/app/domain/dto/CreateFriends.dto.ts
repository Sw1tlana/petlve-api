import { IsString, IsUrl, IsArray, ArrayMinSize, ArrayMaxSize, IsObject } from "class-validator";
import { IFriends } from "../friends/Friends.types";

export class CreateFriends implements Omit<IFriends, "id"> {
  
  @IsString()
  title: string;

  @IsUrl()
  url: string;

  @IsUrl()
  addressUrl: string;

  @IsString()
  imageUrl: string;

  @IsString()
  address: string;

  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @IsObject({ each: true })
  workDays: [
    {  id: string; isOpen: boolean; from?: string; to?: string },  
    { _id: string; isOpen: boolean; from?: string; to?: string }, 
    { _id: string; isOpen: boolean; from?: string; to?: string },
    { _id: string; isOpen: boolean; from?: string; to?: string },
    { _id: string; isOpen: boolean; from?: string; to?: string },
    { _id: string; isOpen: boolean; from?: string; to?: string },
    { _id: string; isOpen: boolean; from?: string; to?: string }
  ];

  @IsString()
  phone: string;

  @IsString()
  email: string;
}