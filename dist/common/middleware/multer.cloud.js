"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const node_os_1 = require("node:os");
const multer_enum_1 = require("../enum/multer.enum");
const globalErrorHandling_1 = require("../utilitis/globalErrorHandling");
const multerCloud = ({ customTypes = multer_enum_1.MulterEnum.image, store_type = multer_enum_1.StoreEnum.memory } = {}) => {
    const storage = store_type == multer_enum_1.StoreEnum.memory ?
        multer_1.default.memoryStorage() :
        multer_1.default.diskStorage({
            destination: (0, node_os_1.tmpdir)(),
            filename: (req, file, cb) => {
                cb(null, Date.now() + "-" + Math.random() + "-" + file.originalname);
            }
        });
    function fileFilter(req, file, cb) {
        if (customTypes?.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new globalErrorHandling_1.AppError("Invalid file"));
        }
    }
    const upload = (0, multer_1.default)({ storage, fileFilter });
    return upload;
};
exports.default = multerCloud;
