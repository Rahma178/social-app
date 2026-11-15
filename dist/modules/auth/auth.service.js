"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globalErrorHandling_1 = require("../../common/utilitis/globalErrorHandling");
const user_repository_1 = require("../../DB/repository/user.repository");
const send_email_1 = __importStar(require("../../common/service/send.email"));
const success_responce_1 = require("../../common/utilitis/success.responce");
const hash_1 = require("../../common/security/hash");
const redis_connection_1 = __importDefault(require("../../DB/redis.connection"));
const encrypt_1 = require("../../common/security/encrypt");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_crypto_1 = require("node:crypto");
const config_service_1 = require("../../config/config.service");
class AuthService {
    _userRepo = new user_repository_1.UserRepository;
    constructor() { }
    // =================== SignUp ========================
    signUp = async (req, res, next) => {
        const { email, fName, lName, password, gender, phone } = req.body;
        const emailExist = await this._userRepo.findOne({ filter: { email } });
        if (emailExist) {
            throw new globalErrorHandling_1.AppError("Email already exists", 409);
        }
        const otp = (0, send_email_1.generate_otp)();
        const hashOtp = await (0, hash_1.Hash)(otp);
        await redis_connection_1.default.setValue({
            key: `otp:${email}`,
            value: hashOtp,
            ttl: 5 * 60
        });
        await (0, send_email_1.default)({
            to: email,
            subject: "Confirm Email",
            html: `<h1>Your OTP is: ${otp}</h1>`
        });
        const user = await this._userRepo.create({
            email,
            fName,
            lName,
            password: await (0, hash_1.Hash)(password),
            gender,
            phone: (0, encrypt_1.Encrypt)(phone),
            isConfirmed: false
        });
        (0, success_responce_1.success_response)({
            res,
            statusCode: 201,
            message: "Done successfully, please check your email for OTP",
            data: { user }
        });
    };
    // ========================== Confirm Email ==========================
    confirmEmail = async (req, res, next) => {
        const { email, otp } = req.body;
        const otpValue = await redis_connection_1.default.getValue(`otp:${email}`);
        if (!otpValue) {
            throw new globalErrorHandling_1.AppError("OTP has expired", 400);
        }
        if (!(0, bcrypt_1.compareSync)(otp, otpValue)) {
            throw new globalErrorHandling_1.AppError("Invalid OTP", 400);
        }
        const user = await this._userRepo.findOneAndUpdate({
            filter: { email, isConfirmed: false },
            update: { isConfirmed: true }
        });
        if (!user) {
            throw new globalErrorHandling_1.AppError("User does not exist or is already confirmed", 400);
        }
        await redis_connection_1.default.deleteKey(`otp:${email}`);
        (0, success_responce_1.success_response)({
            res,
            statusCode: 200,
            message: "Email verified successfully",
            data: { user }
        });
    };
    // ========================== Sign In ==========================
    signIn = async (req, res, next) => {
        const { email, password } = req.body;
        const user = await this._userRepo.findOne({
            filter: { email: email.toLowerCase(), provider: "system" }
        });
        if (!user) {
            throw new globalErrorHandling_1.AppError("Email does not exist or invalid provider", 404);
        }
        if (user.isConfirmed !== true) {
            throw new globalErrorHandling_1.AppError("Please confirm your email first", 400);
        }
        if (!await (0, hash_1.Compare)(password, user.password)) {
            throw new globalErrorHandling_1.AppError("Invalid password", 400);
        }
        const tokenId = (0, node_crypto_1.randomUUID)();
        const access_token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, config_service_1.ACCESS_TOKEN_SIGNATURE, {
            expiresIn: "50m",
            jwtid: tokenId,
            audience: "http://localhost:4000",
            issuer: "http://localhost:3000",
            noTimestamp: true
        });
        const refresh_token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, config_service_1.REFRESH_TOKEN_SIGNATURE, {
            expiresIn: "7d",
            jwtid: tokenId
        });
        (0, success_responce_1.success_response)({
            res,
            statusCode: 200,
            message: "Signed in successfully",
            data: {
                tokens: { access_token, refresh_token }
            }
        });
    };
    // ========================== Refresh Token ==========================
    refreshToken = async (req, res, next) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new globalErrorHandling_1.AppError("Refresh token is required", 400);
        }
        const payload = jsonwebtoken_1.default.verify(refreshToken, config_service_1.REFRESH_TOKEN_SIGNATURE);
        const isRevoked = await redis_connection_1.default.getValue(`revoked:${payload.jti}`);
        if (isRevoked) {
            throw new globalErrorHandling_1.AppError("Token has been revoked, please sign in again", 401);
        }
        const access_token = jsonwebtoken_1.default.sign({ id: payload.id, email: payload.email }, config_service_1.ACCESS_TOKEN_SIGNATURE, { expiresIn: "50m" });
        (0, success_responce_1.success_response)({
            res,
            statusCode: 200,
            message: "Token refreshed successfully",
            data: { access_token }
        });
    };
    // ========================== Logout ==========================
    logout = async (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            throw new globalErrorHandling_1.AppError("Token is required", 400);
        }
        const payload = jsonwebtoken_1.default.decode(token);
        if (payload && payload.jti) {
            await redis_connection_1.default.setValue({
                key: `revoked:${payload.jti}`,
                value: "revoked",
                ttl: 7 * 24 * 60 * 60
            });
        }
        (0, success_responce_1.success_response)({
            res,
            statusCode: 200,
            message: "Logged out successfully"
        });
    };
}
exports.default = new AuthService();
