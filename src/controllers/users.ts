import User, { IUser } from "../models/users";
import { Request, Response } from "express";
import * as v from "../utils/validators";
import bcrypt from "bcryptjs";
import {
  deleteFromCloud,
  passwordCheck,
  upload2cloud,
} from "../utils/helper-functions";

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
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.id !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
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

export async function updateUser(req: Request, res: Response) {
  try {
    const { error } = v.updateUserInfo.validate(req.body, v.options);
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details.map((err) => err.message),
      });
    }
    const userId = req.user.id;
    const user = (await User.findById(userId)) as IUser;
    user.first = req.body.first || user.first;
    user.last = req.body.last || user.last;
    user.phone = req.body.phone || user.phone;

    // update profile picture
    if (req.file) {
      if (req.file.size > 1 * 1000 * 1000) {
        return res.status(400).json({
          message: "Bad request",
          error: "Picture size should not exceed 1 MB",
        });
      }
      if (user.picture) await deleteFromCloud(user.picture);
      user.picture = await upload2cloud(req.file.path);
    }
    await user.save();
    return res.json({
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function updatePassword(req: Request, res: Response) {
  try {
    const { error } = v.updatePassword.validate(req.body, v.options);
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details.map((err) => err.message),
      });
    }

    const { password, oldPassword } = req.body;

    const userId = req.user.id;
    const user = (await User.findById(userId)) as IUser;

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return res.status(400).json({
        message: "Validation failed",
        error: "Old password is incorrect",
      });
    }

    const validPassword = passwordCheck(password);
    if (validPassword !== "valid") {
      return res.status(400).json({
        message: "Validation failed",
        error: validPassword,
      });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    return res.json({
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}
