"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("./user.service"));
const authentication_1 = require("../../common/middleware/authentication");
const express_1 = require("express");
const user_validation_1 = require("./user.validation");
const valodation_1 = require("../../common/middleware/valodation");
const userRouter = (0, express_1.Router)();
userRouter.get("/getProfile", authentication_1.authentication, user_service_1.default.getProfile);
userRouter.patch("/update-profile", authentication_1.authentication, (0, valodation_1.Validation)(user_validation_1.updateProfileSchema), user_service_1.default.updateProfile);
userRouter.post("/follow/:id", authentication_1.authentication, user_service_1.default.followUser);
userRouter.delete("/unfollow/:id", authentication_1.authentication, user_service_1.default.unfollowUser);
userRouter.get("/search", authentication_1.authentication, user_service_1.default.searchUsers);
userRouter.patch("/privacy", authentication_1.authentication, user_service_1.default.updateAccountPrivacy);
exports.default = userRouter;
