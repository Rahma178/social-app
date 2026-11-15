import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userModel, { IUser } from '../../DB/models/user.model';
import { ACCESS_TOKEN_SIGNATURE } from '../../config/config.service';
import RedisService from '../../DB/redis.connection'
import { UserRepository } from '../../DB/repository/user.repository';
const _userRepo = new UserRepository();

declare global {
    namespace Express {
        interface Request {
            user?: IUser & { _id: any };
            decoded?: any;
        }
    }
}

export const authentication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return next(new Error("Token not exist", { cause: 404 }));
        }

        const token = authorization.startsWith("Bearer ") ? authorization.split(" ")[1] : authorization;
        if (!token) {
            return next(new Error("Invalid token format", { cause: 400 }));
        }

        const decoded = jwt.verify(token, ACCESS_TOKEN_SIGNATURE!) as any;
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

        const isRevoked = await RedisService.ttl(`revoke_token::${user._id}::${decoded.jti}`);
        if (isRevoked && isRevoked > 0) {
            return next(new Error("Invalid revoked token, you should login again", { cause: 400 }));
        }

        req.user = user as any;
        req.decoded = decoded;
        next();
    } catch (error: any) {
        return next(new Error(error.message || "Authentication failed", { cause: 500 }));
    }
};