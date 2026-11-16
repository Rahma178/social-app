import * as z from "zod";



export const updateProfileSchema = {
  body: z.object({
    fName: z.string().min(2, "First name must be at least 2 characters").optional(),
    lName: z.string().min(2, "Last name must be at least 2 characters").optional(),
    age: z.number().min(18, "Age must be at least 18").optional(),
    gender: z.enum(["male", "female"]).optional(),
    phone: z.string().optional()
  })
}

