"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const valodation_1 = require("../../common/middleware/valodation");
const auth_service_1 = __importDefault(require("./auth.service"));
const express_1 = require("express");
const auth_validation_1 = require("./auth.validation");
const authentication_1 = require("../../common/middleware/authentication");
const authRouter = (0, express_1.Router)();
authRouter.post("/signup", (0, valodation_1.Validation)(auth_validation_1.signUpSchema), auth_service_1.default.signUp);
authRouter.post("/confirm-email", (0, valodation_1.Validation)(auth_validation_1.confirmEmailSchema), auth_service_1.default.confirmEmail);
authRouter.post("/signIn", (0, valodation_1.Validation)(auth_validation_1.signInSchema), auth_service_1.default.signIn);
authRouter.post("/refresh-token", (0, valodation_1.Validation)(auth_validation_1.refreshTokenSchema), auth_service_1.default.refreshToken);
authRouter.post("/logout", authentication_1.authentication, auth_service_1.default.logout);
exports.default = authRouter;
