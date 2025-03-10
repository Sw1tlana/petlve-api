import { Types } from "mongoose";

export interface IUsers {
  _id: Types.ObjectId; 
  name: string;
  email: string;
  phone: string;
  password: string;
  tokens?: string[];
  refreshToken?: string;
  noticesFavorites: Types.ObjectId[];
  pets: Types.ObjectId[];
  }