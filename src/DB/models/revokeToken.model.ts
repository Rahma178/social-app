import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRevokeToken extends Document {
    tokenId: string;
    userId: Types.ObjectId;
    expireAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const revokeTokenSchema = new Schema<IRevokeToken>(
    {
        tokenId: {
            type: String,
            required: true,
            trim: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        expireAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
        strict: true,
        strictQuery: true,
    }
);

revokeTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const revokeTokenModel =
    (mongoose.models.revokeToken as mongoose.Model<IRevokeToken>) ||
    mongoose.model<IRevokeToken>("revokeToken", revokeTokenSchema);

export default revokeTokenModel;