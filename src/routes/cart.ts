import express from "express";
import * as cart from "../controllers/cart";
import { authenticate } from "../middleware/authentication";

const router = express.Router();

router.use(authenticate);
router.get("/", cart.getCart);
router.post("/add/:dishId", cart.addToCart);
router.post("/decrease/:dishId", cart.decreaseQuantity);
router.post("/remove-dish/:dishId", cart.removeFromCart);
router.post("/clear", cart.clearCart);

export default router;
