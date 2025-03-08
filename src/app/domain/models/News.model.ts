import mongoose, { Document, Schema } from "mongoose";
import { INews } from "../news/News.types";

const NewSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    imgUrl: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    url: { type: String, required: true },
    id: { type: String, required: true }
});

export const News = mongoose.model<INews & Document>("News", NewSchema);