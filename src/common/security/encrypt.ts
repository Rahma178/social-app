import crypto from "node:crypto";
import { ENCRYPTION_KEY } from "../../config/config.service";

const IV_LENGTH = 16;
const SECRET_KEY: string = ENCRYPTION_KEY!;

export function Encrypt(plainText: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'utf8'), iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

export function Decrypt(text: string): string {
    const parts = text.split(':');
    const ivHex: string = parts[0]!;
    const encryptedText: string = parts[1]!;

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'utf8'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}