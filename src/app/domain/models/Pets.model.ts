import mongoose, { Document, Schema } from "mongoose";
import { IPets } from "../pets/Pets.types";

const PetsSchema = new mongoose.Schema({
    species: { type: String, required: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    birthday: { type: Date, required: true },
    sex: { type: String, required: true },
    imgURL: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const Pet = mongoose.model<IPets & Document>("Pet", PetsSchema);
