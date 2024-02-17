import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  first: string;
  last: string;
  email: string;
  phone: string;
  password: string;
  isEmailVerified: boolean;
  isAdmin: boolean;
  picture?: string;
}

const userSchema = new mongoose.Schema<IUser>({
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
  isAdmin: {
    type: Boolean,
    default: false,
  },
  picture: {
    type: String,
  },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
