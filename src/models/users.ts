import mongoose from "mongoose";
import { IDish } from "./dish"; // Importing the IDish interface for reference

export interface IUser extends mongoose.Document {
  first: string;
  last: string;
  email: string;
  phone: string;
  password: string;
  isEmailVerified: boolean;
  role: "customer" | "vendor" | "admin";
  picture?: string;
  cart: { dish: IDish["_id"]; quantity: number; totalAmount: number }[]; // Cart structure
  createdAt: string;
  updatedAt: string;
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
    },
    picture: {
      type: String,
    },
    cart: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        totalAmount: {
          type: Number,
          required: true,
        },
      },
    ],
  },

  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
