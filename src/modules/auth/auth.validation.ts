import * as z from "zod";
import { GenderEnum } from "../../common/enum/user.enum";

export const signUpSchema = {
  body: z.strictObject({
    fName: z.string().min(3).max(20).trim(),
    lName: z.string().min(3).max(20).trim(),
    email: z.string().email(),
    password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
    cPassword: z.string(),
    gender: z.enum(GenderEnum).optional(),
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



export const confirmEmailSchema = ({
    body: z.object({
        email: z.string().email("Invalid email format"),
        otp: z.string().length(6, "OTP must be 6 digits")
    })
});

export const signInSchema = ({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters")
    })
});


export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string({ message: "Refresh token is required" })
  })
};


export const forgetPasswordSchema = {
  body: z.object({
    email: z.string().email("Invalid email format")
  })
};


export const resetPasswordSchema = {
  body: z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().min(6, "OTP must be at least 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters")
  })
};



export const googleSignInSchema = {
  body: z.object({
    idToken: z.string().min(1, "Google ID Token is required")
  })
}