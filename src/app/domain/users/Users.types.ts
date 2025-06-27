import { Types } from "mongoose";
import { IPets } from "../pets/Pets.types";
import { INotices } from "../notices/Notices.types";

export interface IUsers {
  _id: Types.ObjectId; 
  name: string;
  email: string;
  phone: string;
  password: string;
  avatar?: string;
  token?: string;
  refreshToken?: string;
  pets: IPets[];
  noticesFavorites: INotices[];
  }