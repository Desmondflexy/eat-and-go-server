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
import { passwordCheck } from "../utils/helper-functions";

export async function signup(req: Request, res: Response) {
  const role = "/signup" === req.url ? "customer" : "vendor";
  const { error } = v.signup.validate(req.body, v.options);
  try {
    // validate request body
    if (error) {
      console.error(error);
      return res.status(400).json({
        message: "Validation failed",
        error: error.details.map((err) => err.message),
      });
    }

    const { fullname, email, phone, password } = req.body;

    const validPassword = passwordCheck(password);
    if (validPassword !== "valid") {
      return res.status(400).json({
        message: "Validation failed",
        error: validPassword,
      });
    }

    if (fullname.split(" ").length !== 2) {
      return res.status(400).json({
        message: "Fullname must contain first and last name only",
      });
    }
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
      role,
    });

    // send email verification link
    const token = await Token.findOne({ userId: user._id, type: "email" });
    if (token) await token.deleteOne();

    await Token.create({
      userId: user._id,
      type: "email",
    });

    const message = getEmailVerificationText(user.first, user.id);

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

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const token = await Token.findOne({ userId, type: "email" });
    if (!token) {
      return res
        .status(404)
        .send(
          `Email already verified, please <a href="${process.env.CLIENT_URL}/login">login</a>.`,
        );
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

    const token = await Token.findOne({ userId: user._id, type: "password" });
    if (token) await token.deleteOne();

    await Token.create({
      userId: user._id,
      type: "password",
    });

    const message = getResetPasswordText(user.first, user.id);
    sendMail(user.email, "Password Reset (Eat-and-Go)", message);

    return res.json({
      message: "Password reset link has been sent to your email",
    });
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

    const { password } = req.body;

    const validPassword = passwordCheck(password);
    if (validPassword !== "valid") {
      return res.status(400).json({
        message: "Validation failed",
        error: validPassword,
      });
    }

    const { userId } = req.params;
    const token = await Token.findOne({ userId, type: "password" });
    if (!token) {
      return res.status(400).json({
        message:
          "Operation failed, please request for a new password reset link.",
      });
    }

    if (Date.now() - Date.parse(token.createdAt) > 1000 * 60 * 60 * 2) {
      await token.deleteOne();
      return res.status(400).json({
        message: "Password reset link has expired, please request a new one",
      });
    }
    const user = (await User.findById(userId)) as IUser;

    user.password = await bcrypt.hash(password, 10);
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

    const jwtPayload = {
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(jwtPayload, secretKey, { expiresIn });

    // attach the token to the headers; save in cookies
    res.setHeader("Authorization", `Bearer ${token}`);
    res.cookie("token", token, { maxAge: expiresIn * 1000, httpOnly: true });

    return res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        first: user.first,
        last: user.last,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
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

/**Sign in with Google. User id, email and name is sent from the client */
export async function googleSignOn(req: Request, res: Response) {
  try {
    const { id, email, name } = req.body;
    const { error } = v.googleSignOn.validate(req.body, v.options);
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        error: error.details.map((err) => err.message),
      });
    }
    let user = await User.findOne({ email });

    if (!user) {
      // no user with this email, create one
      const fullname = name.split(" ");
      user = new User({
        email,
        first: fullname[0],
        last: fullname[1],
        role: "customer",
        isEmailVerified: true,
        ssoId: id,
        ssoProvider: "Google",
      });
      await user.save();
    } else if (!user.ssoProvider) {
      // user exists but has not signed in with Google before
      user.ssoProvider = "Google";
      user.ssoId = id;
      await user.save();
    }

    // grant user a token
    const secretKey = process.env.JWT_SECRET as string;
    const expiresIn = Number(process.env.JWT_EXPIRES_IN) * 3600;

    const jwtPayload = {
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(jwtPayload, secretKey, { expiresIn });

    // attach the token to the headers; save in cookies
    res.setHeader("Authorization", `Bearer ${token}`);
    res.cookie("token", token, { maxAge: expiresIn * 1000, httpOnly: true });

    return res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        first: user.first,
        last: user.last,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    //
  }
}
