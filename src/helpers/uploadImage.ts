import cloudinary from '../infra/cloudinary';

export const uploadImageFromPath = async (filePath: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'pets',
  });
  return result.secure_url;
};