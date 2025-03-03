import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_URI = process.env.DB_URI as string;

if (!DB_URI) {
    process.exit(1);
}

async function connectDB() {
    try {
        await mongoose.connect(DB_URI);
        console.log("Database connection successfully");
    } catch (error) {
        console.error("Database connection failure:", error);
        process.exit(1);
    }
}

export default connectDB;