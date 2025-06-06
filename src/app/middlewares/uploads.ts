import multer from "multer";
import path from "path";
import { Request } from "express";
import fs from 'fs';

export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const createStorage = (folderName: string): multer.StorageEngine => {
  const uploadDir = path.resolve(process.cwd(), "uploads", folderName);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });
};

export const uploadAvatar = multer({ storage: createStorage("avatars") });
export const uploadPetPhoto = multer({ storage: createStorage("pets") });
