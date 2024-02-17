import User, { IUser } from "../models/users";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as v from "../utils/validators";
import Token from "../models/token";
import sendMail from "../config/nodemailer";
import {
  getEmailVerificationText,
  getResetPasswordText,
} from "../utils/constants";
import jwt from "jsonwebtoken";
import { IPayload } from "../middleware/authentication";

export async function signup(req: Request, res: Response) {
  const { error } = v.signup.validate(req.body, v.options);
  try {
    // validate request body
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details.map((err) => err.message),
      });
    }

    const { fullname, email, phone, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: "Conflict",
        error: "User already exists with this email",
      });
    }

    // create user
    user = await User.create({
      first: fullname.split(" ")[0],
      last: fullname.split(" ")[1],
      email,
      phone,
      password: await bcrypt.hash(password, 10),
    });

    // send email verification link
    const token = await Token.create({
      userId: user._id,
      type: "email",
    });

    const message = getEmailVerificationText(user.first, token.id);

    sendMail(email, "Email Verification (Eat-and-Go)", message);
    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**Send email verification link to user email. */
export async function verifyEmail(req: Request, res: Response) {
  try {
    const { tokenId } = req.params;
    if (!tokenId) {
      return res.status(400).json({ message: "Token id is required" });
    }
    const token = await Token.findById(tokenId);
    if (!token) {
      return res.status(404).json({ message: "Invalid token" });
    }
    const user = await User.findById(token.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isEmailVerified = true;
    await user.save();
    await token.deleteOne();
    return res.redirect(`${process.env.CLIENT_URL}/login`);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

/**Send password reset link to user email. */
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { error } = v.forgotPassword.validate(req.body, v.options);
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details.map((err) => err.message),
      });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let token = await Token.findOne({ userId: user._id, type: "password" });
    if (token) await token.deleteOne();

    token = await Token.create({
      userId: user._id,
      type: "password",
    });

    const message = getResetPasswordText(user.first, token.id);

    sendMail(user.email, "Password Reset (Eat-and-Go)", message);
    return res.json({ message: "Password reset link sent to your email" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { error } = v.resetPassword.validate(req.body, v.options);
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details.map((err) => err.message),
      });
    }
    const { tokenId } = req.params;
    const token = await Token.findOne({ _id: tokenId });
    if (!token) return res.status(404).json({ message: "Invalid token" });

    const user = (await User.findById(token.userId)) as IUser;

    user.password = await bcrypt.hash(req.body.password, 10);
    await user.save();
    await token.deleteOne();
    return res.json({ message: "Password reset successful" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { error } = v.login.validate(req.body, v.options);
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details.map((err) => err.message),
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // grant user a token
    const secretKey = process.env.JWT_SECRET as string;
    const expiresIn = Number(process.env.JWT_EXPIRES_IN) * 3600;

    const jwtPayload: IPayload = {
      id: user._id,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(jwtPayload, secretKey, { expiresIn });

    // attach the token to the headers; save in cookies
    res.setHeader("Authorization", `Bearer ${token}`);
    res.cookie("token", token, { maxAge: expiresIn * 1000, httpOnly: true });

    return res.json({
      message: "Login successful",
      token,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie("token");
  res.removeHeader("Authorization");
  res.json({
    message: "Logged out successfully",
  });
}
