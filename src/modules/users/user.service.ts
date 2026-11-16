import { type NextFunction, type Request, type Response } from 'express' 
import { UserRepository } from '../../DB/repository/user.repository';
import { AppError } from '../../common/utilitis/globalErrorHandling';
import { Decrypt, Encrypt } from '../../common/security/encrypt';
import { success_response } from '../../common/utilitis/success.responce';
import { FollowModel } from '../../DB/models/follow.model';
import { Types } from 'mongoose';

class AuthService {

    private readonly _userRepo = new UserRepository;

    constructor() {}


    // ========================== Get Profile ==========================
    getProfile = async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user._id;

        const user = await this._userRepo.findById({
            id: userId,
            options: { password: 0 } 
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (user.phone) {
            user.phone = Decrypt(user.phone);
        }

        success_response({
            res,
            statusCode: 200,
            message: "Done",
            data: { user }
        });
    }



    // ========================== Update Profile ==========================
    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        const { fName, lName, age, gender, phone } = req.body;
        const userId = (req as any).user._id;

        let updateQuery: any = {};

        if (fName !== undefined) updateQuery.fName = fName;
        if (lName !== undefined) updateQuery.lName = lName;
        if (age !== undefined) updateQuery.age = age;
        if (gender !== undefined) updateQuery.gender = gender;
        if (phone !== undefined) updateQuery.phone = Encrypt(phone);

        const user = await this._userRepo.findOneAndUpdate({
            filter: { _id: userId },
            update: updateQuery
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        success_response({
            res,
            statusCode: 200,
            message: "Profile updated successfully",
            data: { user }
        });
    }



    // ========================== Follow User ==========================
   followUser = async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = (req as any).user._id;
        const { id: targetUserId } = req.params;

        if (!targetUserId || Array.isArray(targetUserId)) {
            throw new AppError("Invalid user ID", 400);
        }

        const targetId = targetUserId;

        if (currentUserId.toString() === targetId) {
            throw new AppError("You cannot follow yourself", 400);
        }

        const targetUser = await this._userRepo.findById({ id: targetId });
        if (!targetUser) {
            throw new AppError("User not found", 404);
        }

        const existingFollow = await FollowModel.findOne({ 
            follower: currentUserId, 
            following: new Types.ObjectId(targetId) 
        });

        if (existingFollow) {
            throw new AppError("You are already following this user", 400);
        }

        await FollowModel.create({
            follower: currentUserId,
            following: new Types.ObjectId(targetId)
        });

        return res.status(200).json({ message: "User followed successfully" });
    }

    // ========================== Unfollow User ==========================
    unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
        const currentUserId = (req as any).user._id;
        const { id: targetUserId } = req.params;

        const targetId = Array.isArray(targetUserId) ? targetUserId[0] : targetUserId;

        const followRecord = await FollowModel.findOneAndDelete({
            follower: currentUserId,
            following: new Types.ObjectId(targetId)
        });

        if (!followRecord) {
            throw new AppError("You are not following this user", 400);
        }

        return res.status(200).json({ message: "User unfollowed successfully" });
    }


    // ========================== Search Users ==========================
    searchUsers = async (req: Request, res: Response, next: NextFunction) => {
        const keyword = req.query.keyword as string;

        if (!keyword) {
            throw new AppError("Search keyword is required", 400);
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
    }



    // ========================== Toggle Account Privacy ==========================
    updateAccountPrivacy = async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user._id;
        const { isPrivate } = req.body; 

        if (typeof isPrivate !== "boolean") {
            throw new AppError("isPrivate must be a boolean value", 400);
        }

        const user = await this._userRepo.findOneAndUpdate({
            filter: { _id: userId },
            update: { isPrivate }
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return res.status(200).json({ 
            message: `Account privacy updated to ${isPrivate ? "Private" : "Public"} successfully`, 
            user 
        });
    }









}



export default new AuthService()