import { IsDate, IsString } from "class-validator";
import { INews } from "../news/News.types";

export class CreateNews implements Omit<INews, "id"> {
  
    @IsString()
    title: string;

    @IsString()
    text: string;

    @IsDate()
    date: Date;

    @IsString()
    url: string;

    @IsString()
    imgUrl: string;
}
