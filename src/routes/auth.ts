import express from "express";
import * as authController from "../controllers/auth";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/vendor-signup", authController.signup);
router.get("/email-verify/:userId", authController.verifyEmail);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password/:userId", authController.resetPassword);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/google", authController.googleSignOn);

export default router;
