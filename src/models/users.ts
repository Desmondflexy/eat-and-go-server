import { Document, Schema, model } from "mongoose";
import { IDish } from "./dish";

export interface IUser extends Document {
  first: string;
  last: string;
  email: string;
  phone?: string;
  password: string;
  isEmailVerified: boolean;
  role: "customer" | "vendor" | "admin";
  picture?: string;
  cart: {
    dish: IDish;
    quantity: number;
  }[];
  createdAt: string;
  updatedAt: string;
  ssoId?: string;
  ssoProvider?: string;
}

const userSchema = new Schema<IUser>(
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
    cart: {
      type: [
        {
          dish: {
            type: Schema.Types.ObjectId,
            ref: "Dish",
            required: true,
          },
          quantity: {
            type: Number,
            default: 1,
            required: true,
          },
          _id: false,
        },
      ],
      default: [],
    },
    ssoId: {
      type: String,
    },
    ssoProvider: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
);

const User = model<IUser>("User", userSchema);

export default User;
