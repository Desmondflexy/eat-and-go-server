import mongoose from "mongoose";

export interface IOrder extends mongoose.Document {
  userId: string;
  items: {
    dish: string;
    quantity: number;
    totalAmount: number;
    weight: number;
  }[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    items: {
      type: [
        {
          dish: {
            type: String,
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
          weight: {
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
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
