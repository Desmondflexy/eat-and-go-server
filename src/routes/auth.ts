import express from "express";
import * as authController from "../controllers/auth";

const router = express.Router();

router.post("/signup", authController.signup);
router.get("/email-verify/:userId", authController.verifyEmail);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password/:userId", authController.resetPassword);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

export default router;
