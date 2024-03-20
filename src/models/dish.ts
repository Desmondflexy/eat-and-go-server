import mongoose from "mongoose";
import { IUser } from "./users"; //Importing the IUser interface for reference

export interface IDish extends mongoose.Document {
  name: string;
  category: string;
  size: number;
  price: number;
  notes?: string;
  picture: string;
  vendorId: IUser["_id"]; // Reference to User ID
  // vendorId: string;
  createdAt: string;
  updatedAt: string;
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
  },
  {
    timestamps: true,
  },
);

// Method to find a dish by ID
dishSchema.statics.findById = async function (id: string) {
  return this.findOne({ _id: id });
};

const Dish = mongoose.model<IDish>("Dish", dishSchema);
export default Dish;
