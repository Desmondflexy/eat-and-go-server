import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  ssoId?: string;
  ssoProvider?: string;
  isEmailVerified: boolean;
  picture?: string;
  role: string;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    ssoId: { type: String, required: false },
    ssoProvider: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    role: { type: String, required: true },
    picture: {
      type: String,
      default:
        "null",
    },
  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
