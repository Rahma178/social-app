import mongoose,{mongo} from "mongoose";
import { GenderEnum, RoleEnum } from "../../common/enum/user.enum";
import sendEmail from "../../common/service/send.email";
import { hashSync } from "bcrypt";



export interface IUser {
  fName: string,
  lName: string,
  email: string,
  password: string,
  gender?: GenderEnum,
  role?: RoleEnum,
  isConfirmed?: boolean,
  phone?: string,
  profileImage?: string,
  changeCredentialAt?: Date,
  isPrivate: { type: Boolean, default: false }
}


const userSchema = new mongoose.Schema<IUser>({
  fName: { type: String, trim: true, minLength: 3, maxLength: 20, required: true },
  lName: { type: String, trim: true, minLength: 3, maxLength: 20, required: true },
  email: { type: String, trim: true, unique: true, required: true },
  password: { type: String, trim: true, required: true },
  gender: { type: String, enum: [GenderEnum.female, GenderEnum.male], default: GenderEnum.male },
  role: { type: String, enum: [RoleEnum.user, RoleEnum.admin], default: RoleEnum.user },
  phone: String,
  profileImage: String,
  isConfirmed: Boolean,
}, {
  timestamps: true,
  strictQuery: true
})


// userSchema.pre("validate", async function () {
//     console.log("==============pre validate hook==============");
//     console.log(this);
// })

// userSchema.pre("save", async function () {
//     console.log("============== pre save hook==============");
//     console.log(this);
//     this.password = hashSync(this.password, 12);
// })

// userSchema.post("save", async function () {
//     console.log("==============post save hook==============");
//     console.log(this);
//     await sendEmail({ to: this.email, subject: "confirm email" });
// })

// userSchema.post("validate", async function () {
//     console.log("============== post validate hook==============");
//     console.log(this);
// })


const userModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
export default userModel

