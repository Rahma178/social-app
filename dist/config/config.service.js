"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIANCE_GMAIL = exports.REFRESH_TOKEN_SIGNATURE = exports.ACCESS_TOKEN_SIGNATURE = exports.ENCRYPTION_KEY = exports.PASSWORD = exports.EMAIL = exports.REDIS_URL = exports.DB_URI = exports.PORT = void 0;
const dotenv_1 = require("dotenv");
const node_path_1 = require("node:path");
const NODE_ENV = process.env.NODE_ENV;
const envPath = {
    development: '.env.development',
    production: '.env.production',
};
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)(envPath[NODE_ENV]) });
exports.PORT = +process.env.PORT;
exports.DB_URI = process.env.DB_URI;
exports.REDIS_URL = process.env.REDIS_URL;
exports.EMAIL = process.env.EMAIL;
exports.PASSWORD = process.env.PASSWORD;
exports.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
exports.ACCESS_TOKEN_SIGNATURE = process.env.ACCESS_TOKEN_SIGNATURE;
exports.REFRESH_TOKEN_SIGNATURE = process.env.REFRESH_TOKEN_SIGNATURE;
exports.AUDIANCE_GMAIL = process.env.AUDIANCE_GMAIL;
