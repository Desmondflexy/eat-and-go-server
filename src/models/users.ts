import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  first: string;
  last: string;
  email: string;
  phone: string;
  password: string;
  isEmailVerified: boolean;
  role: string;
  picture?: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    first: {
      type: String,
      required: true,
    },
    last: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    picture: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
