import mongoose, { Document, Schema } from "mongoose";
import { IUsers } from "../users/Users.types";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 20 },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  token: { type: String, default: null },
  refreshToken: { type: String, default: null },
  noticesFavorites: [{ type: Schema.Types.ObjectId, ref: "Notice" }],
  noticesViewed: [{ type: Schema.Types.ObjectId, ref: "Notice"}],
  pets: [{ type: Schema.Types.ObjectId, ref: "Pet" }],
},
{ timestamps: true });

export const User = mongoose.model<IUsers & Document>("User", UserSchema);