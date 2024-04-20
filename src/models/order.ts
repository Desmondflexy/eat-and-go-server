import { Document, Types, Schema, model } from "mongoose";
import { IDish } from "./dish";

export interface IOrder extends Document {
  userId: Types.ObjectId;
  orderNo: number;
  items: {
    dish: IDish;
    quantity: number;
  }[];
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNo: {
      type: Number,
      required: true,
      unique: true,
    },
    items: {
      type: [
        {
          dish: {
            type: Schema.Types.ObjectId,
            ref: "Dish",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          _id: false,
        },
      ],
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Order = model<IOrder>("Order", orderSchema);
export default Order;
