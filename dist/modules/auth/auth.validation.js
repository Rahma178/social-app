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
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.signInSchema = exports.confirmEmailSchema = exports.signUpSchema = void 0;
const z = __importStar(require("zod"));
const user_enum_1 = require("../../common/enum/user.enum");
exports.signUpSchema = {
    body: z.strictObject({
        fName: z.string().min(3).max(20).trim(),
        lName: z.string().min(3).max(20).trim(),
        email: z.string().email(),
        password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
        cPassword: z.string(),
        gender: z.enum(user_enum_1.GenderEnum).optional(),
        phone: z.string()
    })
        // .refine((val) => {
        //   return val.password === val.cPassword
        // }, {
        //   message: "password and confirm password must be the same",
        //   path: ["cPassword"]
        // })
        .superRefine((val, ctx) => {
        if (val.password !== val.cPassword) {
            ctx.addIssue({
                code: "custom",
                message: "password and confirm password must be the same",
                origin: ["cPassword"]
            });
        }
    })
};
exports.confirmEmailSchema = ({
    body: z.object({
        email: z.string().email("Invalid email format"),
        otp: z.string().length(6, "OTP must be 6 digits")
    })
});
exports.signInSchema = ({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters")
    })
});
exports.refreshTokenSchema = {
    body: z.object({
        refreshToken: z.string({ message: "Refresh token is required" })
    })
};
