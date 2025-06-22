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
  pets: [{ 
      _id: mongoose.Schema.Types.ObjectId,
      species: String,
      title: String,
      name: String,
      birthday: Date,      
      sex: String,
      photo: String,
   }],
},
{ timestamps: true });

export const User = mongoose.model<IUsers & Document>("User", UserSchema);