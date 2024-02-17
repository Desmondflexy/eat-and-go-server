import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface IPayload {
  id: string;
  isAdmin: boolean;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
      error: "No token provided",
    });
  }

  const secret = process.env.JWT_SECRET as string;
  try {
    const decodedPayload = jwt.verify(token, secret);
    req.user = decodedPayload as IPayload;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
      error: "Invalid token",
    });
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      message: "Forbidden",
      error: "You are not authorized to access this resource.",
    });
  }
  next();
}

declare module "express-serve-static-core" {
  interface Request {
    user: IPayload;
  }
}
