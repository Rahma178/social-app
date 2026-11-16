"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = require("../../DB/repository/user.repository");
const globalErrorHandling_1 = require("../../common/utilitis/globalErrorHandling");
const encrypt_1 = require("../../common/security/encrypt");
const success_responce_1 = require("../../common/utilitis/success.responce");
const follow_model_1 = require("../../DB/models/follow.model");
const mongoose_1 = require("mongoose");
class AuthService {
    _userRepo = new user_repository_1.UserRepository;
    constructor() { }
    // ========================== Get Profile ==========================
    getProfile = async (req, res, next) => {
        const userId = req.user._id;
        const user = await this._userRepo.findById({
            id: userId,
            options: { password: 0 }
        });
        if (!user) {
            throw new globalErrorHandling_1.AppError("User not found", 404);
        }
        if (user.phone) {
            user.phone = (0, encrypt_1.Decrypt)(user.phone);
        }
        (0, success_responce_1.success_response)({
            res,
            statusCode: 200,
            message: "Done",
            data: { user }
        });
    };
    // ========================== Update Profile ==========================
    updateProfile = async (req, res, next) => {
        const { fName, lName, age, gender, phone } = req.body;
        const userId = req.user._id;
        let updateQuery = {};
        if (fName !== undefined)
            updateQuery.fName = fName;
        if (lName !== undefined)
            updateQuery.lName = lName;
        if (age !== undefined)
            updateQuery.age = age;
        if (gender !== undefined)
            updateQuery.gender = gender;
        if (phone !== undefined)
            updateQuery.phone = (0, encrypt_1.Encrypt)(phone);
        const user = await this._userRepo.findOneAndUpdate({
            filter: { _id: userId },
            update: updateQuery
        });
        if (!user) {
            throw new globalErrorHandling_1.AppError("User not found", 404);
        }
        (0, success_responce_1.success_response)({
            res,
            statusCode: 200,
            message: "Profile updated successfully",
            data: { user }
        });
    };
    // ========================== Follow User ==========================
    followUser = async (req, res, next) => {
        const currentUserId = req.user._id;
        const { id: targetUserId } = req.params;
        if (!targetUserId || Array.isArray(targetUserId)) {
            throw new globalErrorHandling_1.AppError("Invalid user ID", 400);
        }
        const targetId = targetUserId;
        if (currentUserId.toString() === targetId) {
            throw new globalErrorHandling_1.AppError("You cannot follow yourself", 400);
        }
        const targetUser = await this._userRepo.findById({ id: targetId });
        if (!targetUser) {
            throw new globalErrorHandling_1.AppError("User not found", 404);
        }
        const existingFollow = await follow_model_1.FollowModel.findOne({
            follower: currentUserId,
            following: new mongoose_1.Types.ObjectId(targetId)
        });
        if (existingFollow) {
            throw new globalErrorHandling_1.AppError("You are already following this user", 400);
        }
        await follow_model_1.FollowModel.create({
            follower: currentUserId,
            following: new mongoose_1.Types.ObjectId(targetId)
        });
        return res.status(200).json({ message: "User followed successfully" });
    };
    // ========================== Unfollow User ==========================
    unfollowUser = async (req, res, next) => {
        const currentUserId = req.user._id;
        const { id: targetUserId } = req.params;
        const targetId = Array.isArray(targetUserId) ? targetUserId[0] : targetUserId;
        const followRecord = await follow_model_1.FollowModel.findOneAndDelete({
            follower: currentUserId,
            following: new mongoose_1.Types.ObjectId(targetId)
        });
        if (!followRecord) {
            throw new globalErrorHandling_1.AppError("You are not following this user", 400);
        }
        return res.status(200).json({ message: "User unfollowed successfully" });
    };
    // ========================== Search Users ==========================
    searchUsers = async (req, res, next) => {
        const keyword = req.query.keyword;
        if (!keyword) {
            throw new globalErrorHandling_1.AppError("Search keyword is required", 400);
        }
        const users = await this._userRepo.find({
            filter: {
                $or: [
                    { fName: { $regex: keyword, $options: "i" } },
                    { lName: { $regex: keyword, $options: "i" } },
                    { email: { $regex: keyword, $options: "i" } }
                ]
            },
            options: { password: 0 }
        });
        return res.status(200).json({ message: "Done", count: users.length, users });
    };
    // ========================== Toggle Account Privacy ==========================
    updateAccountPrivacy = async (req, res, next) => {
        const userId = req.user._id;
        const { isPrivate } = req.body;
        if (typeof isPrivate !== "boolean") {
            throw new globalErrorHandling_1.AppError("isPrivate must be a boolean value", 400);
        }
        const user = await this._userRepo.findOneAndUpdate({
            filter: { _id: userId },
            update: { isPrivate }
        });
        if (!user) {
            throw new globalErrorHandling_1.AppError("User not found", 404);
        }
        return res.status(200).json({
            message: `Account privacy updated to ${isPrivate ? "Private" : "Public"} successfully`,
            user
        });
    };
}
exports.default = new AuthService();
