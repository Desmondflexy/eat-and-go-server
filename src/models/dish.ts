import mongoose from "mongoose";

export interface IDish extends mongoose.Document {
  name: string;
  category: string;
  size: number;
  price: number;
  notes?: string;
  picture: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
  isAvailable: boolean;
}

const dishSchema = new mongoose.Schema<IDish>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
    },
    picture: {
      type: String,
      required: true,
    },
    vendorId: {
      type: String,
      required: true,
      ref: "User",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Dish = mongoose.model<IDish>("Dish", dishSchema);
export default Dish;
