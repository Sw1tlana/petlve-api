import { Types } from "mongoose";

export interface IPets {
    species: string;
    title: string;
    name: string;
    birthday: string;
    sex: string;
    imgURL: string;
    owner: Types.ObjectId;
}

