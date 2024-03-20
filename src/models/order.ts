import mongoose from "mongoose";
import { IUser } from "./users"; // Import the IUser interface for reference
import { IDish } from "./dish"; // Import the IDish interface for reference

// eslint-disable-next-line prettier/prettier
export interface IOrder extends mongoose.Document {
  userId: IUser["_id"]; // Reference to User ID
  items: { dish: IDish["_id"]; quantity: number; totalAmount: number }[]; // Order items
  status: string;
  createdAt: string;
  updatedAt: string;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        dish: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        totalAmount: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Completed", "Cancelled"], // Define possible status values
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
