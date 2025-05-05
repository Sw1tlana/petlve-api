import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({

    destination: (_req: Request, _file: Express.Multer.File, cb) => {
        console.log("File is being saved to:", uploadDir); 
        cb(null, uploadDir);
      },

  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    console.log("File saved as:", ext);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext); 
  }
});

export const upload = multer({ storage });