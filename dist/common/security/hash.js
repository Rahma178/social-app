"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compare = exports.Hash = void 0;
const bcrypt_1 = require("bcrypt");
const Hash = async (plainText, SALT_ROUNDS = 12) => {
    if (!plainText)
        throw new Error("password is required");
    return (0, bcrypt_1.hashSync)(String(plainText), SALT_ROUNDS);
};
exports.Hash = Hash;
const Compare = async (plainText, cipherText) => {
    return (0, bcrypt_1.compareSync)(plainText, cipherText);
};
exports.Compare = Compare;
