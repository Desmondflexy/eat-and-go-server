import { sign } from "jsonwebtoken";
import User from "../models/users";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export async function signup(req: Request, res: Response) {
    try {
        const { email, password, firstName, lastName, phone } = req.body;
        const salt = 10;

        if (!email || !password || !firstName || !lastName || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, salt);

        const secret_key = process.env.JWT_SECRET;

        const user = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            picture: "null",
            role: "user",
            completeProfile: false,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}