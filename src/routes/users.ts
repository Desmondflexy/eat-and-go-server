import express from "express";
import { deleteUser, getAllUsers, getUser } from "../controllers/users";
import { authenticate } from "../middleware/authentication";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/user", authenticate, getUser);
router.delete("/user", authenticate, deleteUser);

export default router;
