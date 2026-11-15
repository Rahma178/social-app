import { compareSync, hashSync } from "bcrypt";

export const Hash = async (plainText: string, SALT_ROUNDS = 12) => {
    if (!plainText) throw new Error("password is required");
    return hashSync(String(plainText), SALT_ROUNDS);
};

export const Compare = async (plainText: string, cipherText: string) => {
    return compareSync(plainText, cipherText);
};