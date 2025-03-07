import mongoose, { Document, Schema } from "mongoose";
import {IFriends} from "../../domain/friends/Friends.types";

const WorkDaySchema = new Schema({
    id: { type: String, required: true },
    isOpen: { type: Boolean, required: true },
    from: { type: String, required: false },
    to: { type: String, required: false }
  });
  
  // Опис основної схеми Friend
  const FriendSchema = new Schema<IFriends & Document>({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    addressUrl: { type: String, required: true },
    imageUrl: { type: String, required: true },
    address: { type: String, required: true },
    workDays: { type: [WorkDaySchema], required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  });
  

export const Friend = mongoose.model<IFriends & Document>("Friend", FriendSchema);