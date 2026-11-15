"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_1 = require("../../common/enum/user.enum");
const send_email_1 = __importDefault(require("../../common/service/send.email"));
const bcrypt_1 = require("bcrypt");
const userSchema = new mongoose_1.default.Schema({
    fName: { type: String, trim: true, minLength: 3, maxLength: 20, required: true },
    lName: { type: String, trim: true, minLength: 3, maxLength: 20, required: true },
    email: { type: String, trim: true, unique: true, required: true },
    password: { type: String, trim: true, required: true },
    gender: { type: String, enum: [user_enum_1.GenderEnum.female, user_enum_1.GenderEnum.male], default: user_enum_1.GenderEnum.male },
    role: { type: String, enum: [user_enum_1.RoleEnum.user, user_enum_1.RoleEnum.admin], default: user_enum_1.RoleEnum.user },
    phone: String,
    profileImage: String,
    isConfirmed: Boolean,
}, {
    timestamps: true,
    strictQuery: true
});
userSchema.pre("validate", async function () {
    console.log("==============pre validate hook==============");
    console.log(this);
});
userSchema.pre("save", async function () {
    console.log("============== pre save hook==============");
    console.log(this);
    this.password = (0, bcrypt_1.hashSync)(this.password, 12);
});
userSchema.post("save", async function () {
    console.log("==============post save hook==============");
    console.log(this);
    await (0, send_email_1.default)({ to: this.email, subject: "confirm email" });
});
userSchema.post("validate", async function () {
    console.log("============== post validate hook==============");
    console.log(this);
});
const userModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
exports.default = userModel;
