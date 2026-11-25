import { type NextFunction, type Request, type Response } from 'express'
import userModel, { IUser } from '../../DB/models/user.model'
import { AppError } from '../../common/utilitis/globalErrorHandling'
import { signUpSchema } from './auth.validation';
import { HydratedDocument } from 'mongoose';
import { DBRepository } from '../../DB/repository/db.repository';
import { UserRepository } from '../../DB/repository/user.repository';
import sendEmail, { generate_otp } from '../../common/service/send.email';
import { success_response } from '../../common/utilitis/success.responce';
import { Compare, Hash } from '../../common/security/hash';
import  RedisService  from '../../DB/redis.connection';
import { Encrypt } from '../../common/security/encrypt';
import { compareSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { ACCESS_TOKEN_SIGNATURE, AUDIANCE_GMAIL, REFRESH_TOKEN_SIGNATURE } from '../../config/config.service';
import { OAuth2Client } from 'google-auth-library';
import { S3Service } from '../../common/service/s3.service';

class AuthService {

    private readonly _userRepo = new UserRepository;
    private readonly s3Service = new S3Service;

    constructor() {}

  // =================== SignUp ========================
    signUp = async (req: Request, res: Response, next: NextFunction) => {
        const { email, fName, lName, password, gender, phone }: IUser = req.body;
        const emailExist = await this._userRepo.findOne({ filter: { email } });
        if (emailExist) {
            throw new AppError("Email already exists", 409);
        }
        const otp = generate_otp();
        const hashOtp = await Hash(otp);

        await RedisService.setValue({
            key: `otp:${email}`,
            value: hashOtp,
            ttl: 5 * 60
        });

        await sendEmail({
            to: email,
            subject: "Confirm Email",
            html: `<h1>Your OTP is: ${otp}</h1>`
        });

        const user = await this._userRepo.create({
            email,
            fName,
            lName,
            password: await Hash(password),
            gender,
            phone: Encrypt(phone!),
            isConfirmed: false 
        } as Partial<IUser>);

        success_response({
            res,
            statusCode: 201,
            message: "Done successfully, please check your email for OTP",
            data: { user }
        });
    }



    // ========================== Confirm Email ==========================
    confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp } = req.body;
        const otpValue = await RedisService.getValue(`otp:${email}`);
        if (!otpValue) {
            throw new AppError("OTP has expired", 400);
        }

        if (!compareSync(otp, otpValue)) {
            throw new AppError("Invalid OTP", 400);
        }
        const user = await this._userRepo.findOneAndUpdate({
            filter: { email, isConfirmed: false },
            update: { isConfirmed: true }
        });

        if (!user) {
            throw new AppError("User does not exist or is already confirmed", 400);
        }

        await RedisService.deleteKey(`otp:${email}`);

        success_response({
            res,
            statusCode: 200,
            message: "Email verified successfully",
            data: { user }
        });
    }


    // ========================== Sign In ==========================
    signIn = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        const user = await this._userRepo.findOne({ 
            filter: { email: email.toLowerCase(), provider: "system" }
        });
        if (!user) {
            throw new AppError("Email does not exist or invalid provider", 404);
        }

        if (user.isConfirmed !== true) {
            throw new AppError("Please confirm your email first", 400);
        }

        if (!await Compare(password, user.password!)) {
            throw new AppError("Invalid password", 400);
        }

        const tokenId = randomUUID();

        const access_token = jwt.sign(
            { id: user._id, email: user.email }, 
            ACCESS_TOKEN_SIGNATURE, 
            {
                expiresIn: "50m",
                jwtid: tokenId,
                audience: "http://localhost:4000",
                issuer: "http://localhost:3000",
                noTimestamp: true
            }
        );

        const refresh_token = jwt.sign(
            { id: user._id, email: user.email }, 
            REFRESH_TOKEN_SIGNATURE, 
            {
                expiresIn: "7d",
                jwtid: tokenId
            }
        );

        success_response({
            res,
            statusCode: 200,
            message: "Signed in successfully",
            data: { 
                tokens: { access_token, refresh_token } 
            }
        });
    }



    // ========================== Refresh Token ==========================
    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError("Refresh token is required", 400);
        }

        const payload: any = jwt.verify(refreshToken, REFRESH_TOKEN_SIGNATURE);

        const isRevoked = await RedisService.getValue(`revoked:${payload.jti}`);
        if (isRevoked) {
            throw new AppError("Token has been revoked, please sign in again", 401);
        }

        const access_token = jwt.sign(
            { id: payload.id, email: payload.email },
            ACCESS_TOKEN_SIGNATURE,
            { expiresIn: "50m" }
        );

        success_response({
            res,
            statusCode: 200,
            message: "Token refreshed successfully",
            data: { access_token }
        });
    }


    // ========================== Logout ==========================
    logout = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (!token) {
            throw new AppError("Token is required", 400);
        }

        const payload: any = jwt.decode(token);
        if (payload && payload.jti) {
            await RedisService.setValue({
                key: `revoked:${payload.jti}`,
                value: "revoked",
                ttl: 7 * 24 * 60 * 60
});
        }

        success_response({
            res,
            statusCode: 200,
            message: "Logged out successfully"
        });
    }



    // ========================== Forget Password ==========================
    forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;

        const user = await this._userRepo.findOne({ filter: { email: email.toLowerCase() } });
        if (!user) {
            throw new AppError("Email not found", 404);
        }

        const otp = generate_otp();
        const hashOtp = await Hash(otp);

        await RedisService.setValue({
            key: `otp:forget:${email}`,
            value: hashOtp,
            ttl: 5 * 60
        });

        await sendEmail({
            to: email,
            subject: "Reset Password OTP",
            html: `<h1>Your Reset Password OTP is: ${otp}</h1>`
        });

        success_response({
            res,
            statusCode: 200,
            message: "OTP sent to your email successfully"
        });
    }


    // ========================== Reset Password ==========================
    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp, newPassword } = req.body;

        const cachedOtp = await RedisService.getValue(`otp:forget:${email}`);
        if (!cachedOtp) {
            throw new AppError("OTP has expired or invalid", 400);
        }

        if (!compareSync(otp, cachedOtp)) {
            throw new AppError("Invalid OTP", 400);
        }

        const hashedPassword = await Hash(newPassword);

        const user = await this._userRepo.findOneAndUpdate({
            filter: { email: email.toLowerCase() },
            update: { 
                password: hashedPassword,
                changeCredentialAt: new Date() 
            }
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        await RedisService.deleteKey(`otp:forget:${email}`);

        success_response({
            res,
            statusCode: 200,
            message: "Password reset successfully, please sign in with your new password"
        });
    }



    // ========================== Sign with Gmail ==========================
    signUpWithGmail = async (req: Request, res: Response, next: NextFunction) => {
        const { idToken } = req.body;
        const client = new OAuth2Client();

        const decoded = await client.verifyIdToken({
            idToken,
            audience: AUDIANCE_GMAIL,
        });
        
        const payload = decoded.getPayload();
        if (!payload || !payload.email) {
            throw new AppError("Invalid Google Token", 400);
        }

        const { family_name, given_name, picture, email_verified, email } = payload;

        let user = await this._userRepo.findOne({ filter: { email: email.toLowerCase() } });

        if (!user) {
            user = await this._userRepo.create({
                fName: given_name,
                lName: family_name || given_name,
                email: email.toLowerCase(),
                profileImage: picture,
                isConfirmed: email_verified,
                provider: "google"
            } as Partial<IUser>);
        }

        const tokenId = randomUUID();

        const access_token = jwt.sign(
            { id: user._id, email: user.email },
            ACCESS_TOKEN_SIGNATURE,
            { expiresIn: "50m", jwtid: tokenId }
        );

        const refresh_token = jwt.sign(
            { id: user._id, email: user.email },
            REFRESH_TOKEN_SIGNATURE,
            { expiresIn: "7d", jwtid: tokenId }
        );

        success_response({
            res,
            statusCode: 200,
            message: "Signed in with Google successfully",
            data: { tokens: { access_token, refresh_token } }
        });
// res.success({ statusCode: 201, message: "User created", data: user });

    }





    test = async (req: Request, res: Response, next: NextFunction) => {
            console.log("TEST HIT", req.files);

        const Key = await this.s3Service.uploadFiles({
            // files: req.files!,
            files: req.files as Express.Multer.File[],
            path: "users"
        });

        // res.status(201).json({ message: "done", key });
        return success_response({
            res,
            statusCode: 201,
            message: "done",
            data: { k: Key }
        });
    }








}


export default new AuthService()