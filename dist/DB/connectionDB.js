"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_service_1 = require("../config/config.service");
const ConnectionDB = async () => {
    await mongoose_1.default.connect(config_service_1.DB_URI)
        .then(() => {
        console.log("DB connected successfully");
    })
        .catch((err) => {
        console.log("DB connected failed");
    });
};
exports.default = ConnectionDB;
