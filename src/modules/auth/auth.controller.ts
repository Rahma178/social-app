import { Validation } from '../../common/middleware/valodation';
import AS from './auth.service'
import { Router } from 'express';
import { confirmEmailSchema, forgetPasswordSchema, googleSignInSchema, refreshTokenSchema, resetPasswordSchema, signInSchema, signUpSchema } from './auth.validation';
import { authentication } from '../../common/middleware/authentication';

const authRouter = Router();


authRouter.post("/signup",Validation(signUpSchema), AS.signUp)
authRouter.post("/confirm-email", Validation(confirmEmailSchema), AS.confirmEmail);
authRouter.post("/signIn", Validation(signInSchema), AS.signIn);
authRouter.post("/refresh-token", Validation(refreshTokenSchema), AS.refreshToken);
authRouter.post("/logout", authentication, AS.logout);
authRouter.post("/forget-password", Validation(forgetPasswordSchema), AS.forgetPassword)
authRouter.patch("/reset-password", Validation(resetPasswordSchema), AS.resetPassword)
authRouter.post("/signin-google", Validation(googleSignInSchema), AS.signUpWithGmail)



export default authRouter;