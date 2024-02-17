import mongoose from "mongoose";

export interface IToken extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: string;
}

const tokenSchema = new mongoose.Schema<IToken>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["email", "password"],
  },
});

const Token = mongoose.model<IToken>("Token", tokenSchema);

export default Token;
