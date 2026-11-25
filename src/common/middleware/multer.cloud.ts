import { Request } from "express"
import multer from "multer"
import { tmpdir } from "node:os"
import { MulterEnum, StoreEnum } from "../enum/multer.enum"
import { AppError } from "../utilitis/globalErrorHandling"

const multerCloud = (
  {
    customTypes = MulterEnum.image,
    store_type = StoreEnum.memory
  }: {
    customTypes?: string[],
    store_type?: StoreEnum
  } = {}
) => {

  const storage = store_type == StoreEnum.memory ?
    multer.memoryStorage() :
    multer.diskStorage({
      destination: tmpdir(),
      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + Math.random() + "-" + file.originalname)
      }
    })

  function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (customTypes?.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError("Invalid file"))
    }
  }

  const upload = multer({ storage, fileFilter })
  return upload
}

export default multerCloud