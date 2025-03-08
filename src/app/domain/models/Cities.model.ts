import mongoose, { Document, Schema } from "mongoose";
import { ICities } from "../cities/Cities.types";

const CitiesSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    useCounty: { type: String, required: true },
    stateEn: { type: String, required: true },
    cityEn: { type: String, required: true },
    countyEn: { type: String, required: true },
});

export const Citie = mongoose.model<ICities & Document>("Citie", CitiesSchema);