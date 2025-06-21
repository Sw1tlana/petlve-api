import mongoose, { Document, Schema } from "mongoose";
import { IUsers } from "../users/Users.types";
import { PetsSchema } from "./Pets.model";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 20 },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  token: { type: String, default: null },
  refreshToken: { type: String, default: null },
  noticesFavorites: [{
  _id: mongoose.Schema.Types.ObjectId,
  species: String,
  category: String,
  price: Number,
  title: String,
  name: String,
  birthday: Date,
  comment: String,
  sex: String,
  location: String,
  imgURL: String,
  createdAt: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  popularity: Number
}],
  noticesViewed: [{ type: Schema.Types.ObjectId, ref: "Notice"}],
  pets: [PetsSchema],
},
{ timestamps: true });

export const User = mongoose.model<IUsers & Document>("User", UserSchema);