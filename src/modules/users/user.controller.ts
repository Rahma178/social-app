import US from './user.service'
import { authentication } from '../../common/middleware/authentication';
import { Router } from 'express';
import { updateProfileSchema } from './user.validation';
import { Validation } from '../../common/middleware/valodation';

const userRouter = Router();

userRouter.get("/getProfile",authentication , US.getProfile)
userRouter.patch("/update-profile", authentication, Validation(updateProfileSchema), US.updateProfile)
userRouter.post("/follow/:id",authentication , US.followUser);

userRouter.delete("/unfollow/:id", authentication, US.unfollowUser);
userRouter.get("/search", authentication, US.searchUsers);
userRouter.patch("/privacy", authentication, US.updateAccountPrivacy);

export default userRouter;