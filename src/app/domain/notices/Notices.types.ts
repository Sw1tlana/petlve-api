import { Types } from "mongoose";

export interface INotices {
     _id: Types.ObjectId;
    species: string;
    category: string;
    price: number;
    title: string;
    name: string;
    birthday: string;
    comment: string;
    sex: string;
    location: string;
    imgURL: string;
    createdAt: Date;
    user: string;
    popularity: number;
    updatedAt: Date;
}