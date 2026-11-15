"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_service_1 = require("../../config/config.service");
const redis_connection_1 = __importDefault(require("../../DB/redis.connection"));
const user_repository_1 = require("../../DB/repository/user.repository");
const _userRepo = new user_repository_1.UserRepository();
const authentication = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return next(new Error("Token not exist", { cause: 404 }));
        }
        const token = authorization.startsWith("Bearer ") ? authorization.split(" ")[1] : authorization;
        if (!token) {
            return next(new Error("Invalid token format", { cause: 400 }));
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_service_1.ACCESS_TOKEN_SIGNATURE);
        if (!decoded?.id) {
            return next(new Error("Invalid token", { cause: 400 }));
        }
        const user = await _userRepo.findOne({ filter: { _id: decoded.id } });
        if (!user) {
            return next(new Error("User not exist", { cause: 400 }));
        }
        if (user.changeCredentialAt && user.changeCredentialAt.getTime() > decoded.iat * 1000) {
            return next(new Error("Token expired, you must login again", { cause: 400 }));
        }
        const isRevoked = await redis_connection_1.default.ttl(`revoke_token::${user._id}::${decoded.jti}`);
        if (isRevoked && isRevoked > 0) {
            return next(new Error("Invalid revoked token, you should login again", { cause: 400 }));
        }
        req.user = user;
        req.decoded = decoded;
        next();
    }
    catch (error) {
        return next(new Error(error.message || "Authentication failed", { cause: 500 }));
    }
};
exports.authentication = authentication;
