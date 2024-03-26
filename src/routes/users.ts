import express from "express";
import * as users from "../controllers/users";
import { authenticate } from "../middleware/authentication";
import upload from "../middleware/multer";

const router = express.Router();

router.get("/", users.getAllUsers);
router.get("/me", authenticate, users.getUser);
router.delete("/:id", authenticate, users.deleteUser);
router.put("/me", authenticate, upload.single("picture"), users.updateUser);
router.put("/me/change-password", authenticate, users.updatePassword);

export default router;
