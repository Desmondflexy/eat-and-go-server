import { Router } from "express";
import { authenticate, isVendor } from "../middleware/authentication";
import * as order from "../controllers/orders";

const router = Router();
router.get("/", authenticate, isVendor, order.getAllOrders);
router.get("/me", authenticate, order.getMyOrders);
router.post("/", authenticate, order.createOrder);
router.get("/:id", authenticate, order.getOrder);

export default router;
