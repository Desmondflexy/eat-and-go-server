import User from "../models/users";
import { Request, Response } from "express";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await User.find().select("-password -__v");
    return res.json({
      message: "All users",
      users,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.json({
      message: "User details",
      user,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    await user.deleteOne();
    return res.json({
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
