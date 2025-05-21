import { Types } from "mongoose";

export interface IPets {
    species: string;
    title: string;
    name: string;
    birthday: string;
    sex: string;
    photo: string;
    owner: Types.ObjectId;
}

