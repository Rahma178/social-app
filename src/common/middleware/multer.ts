import { Request } from "express";
import multer from "multer";
import { MulterEnum, StoreEnum } from "../enum/multer.enum";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { AppError } from "../utilitis/globalErrorHandling";

export const multerCloud = ({
  customTypes = [MulterEnum.images], 
  store_type = StoreEnum.memory
}: {
  customTypes?: string[];
  store_type?: StoreEnum
}) => {
  const storage = store_type === StoreEnum.memory ?
    multer.memoryStorage() :
    multer.diskStorage({
      destination: tmpdir(),
      filename: (req, file, cb) => {
        cb(null, randomUUID() + "-" + file.originalname)
      }
    })

  function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (customTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(null, false);
      cb(new AppError("Invalid file type"));
    }
  }

  const upload = multer({ storage, fileFilter })
  return upload
}