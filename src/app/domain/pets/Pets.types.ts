import { Types } from "mongoose";

export interface IPets {
  _id: Types.ObjectId;
  species: string;
  title: string;
  name: string;
  birthday: Date;       
  sex: string;
  photo: string;
  owner: Types.ObjectId
}

