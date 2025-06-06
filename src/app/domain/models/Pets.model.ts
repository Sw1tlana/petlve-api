import mongoose, { Document, Schema } from "mongoose";
import { IPets } from "../pets/Pets.types";

export const PetsSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    species: { type: String, required: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    birthday: { type: Date, required: true },
    sex: { type: String, required: true },
    photo: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const Pet = mongoose.model<IPets & Document>("Pet", PetsSchema);
