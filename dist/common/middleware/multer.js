"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerCloud = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_enum_1 = require("../enum/multer.enum");
const node_os_1 = require("node:os");
const node_crypto_1 = require("node:crypto");
const globalErrorHandling_1 = require("../utilitis/globalErrorHandling");
const multerCloud = ({ customTypes = [multer_enum_1.MulterEnum.images], store_type = multer_enum_1.StoreEnum.memory }) => {
    const storage = store_type === multer_enum_1.StoreEnum.memory ?
        multer_1.default.memoryStorage() :
        multer_1.default.diskStorage({
            destination: (0, node_os_1.tmpdir)(),
            filename: (req, file, cb) => {
                cb(null, (0, node_crypto_1.randomUUID)() + "-" + file.originalname);
            }
        });
    function fileFilter(req, file, cb) {
        if (customTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(null, false);
            cb(new globalErrorHandling_1.AppError("Invalid file type"));
        }
    }
    const upload = (0, multer_1.default)({ storage, fileFilter });
    return upload;
};
exports.multerCloud = multerCloud;
