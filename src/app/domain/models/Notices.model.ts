import mongoose, { Document, Schema } from "mongoose";
import { INotices } from "../notices/Notices.types";

const NoticeSchema = new mongoose.Schema({
    species: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    birthday: { type: String, required: true },
    comment: { type: String, required: true },
    sex: { type: String, required: true },
    location: { type: String, required: true },
    imgURL: { type: String, required: true },
    user: { type: String, required: true },
    popularity: { type: Number, default: 0 },
}, {
    timestamps: true,
})

export const Notice = mongoose.model<INotices & Document>("Notice", NoticeSchema);