"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encrypt = Encrypt;
exports.Decrypt = Decrypt;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_service_1 = require("../../config/config.service");
const IV_LENGTH = 16;
const SECRET_KEY = config_service_1.ENCRYPTION_KEY;
function Encrypt(plainText) {
    const iv = node_crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'utf8'), iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}
function Decrypt(text) {
    const parts = text.split(':');
    const ivHex = parts[0];
    const encryptedText = parts[1];
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = node_crypto_1.default.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'utf8'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
