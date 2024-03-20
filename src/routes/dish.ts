import express from "express";
import * as dish from "../controllers/dishes";
import { authenticate, isVendor } from "../middleware/authentication";
import upload from "../middleware/multer";

const router = express.Router();

router.get("/", authenticate, dish.getAllDishes);
router.get("/:id", authenticate, dish.getDish);
router.delete("/:id", authenticate, dish.deleteDish);
router.post(
  "/",
  authenticate,
  isVendor,
  upload.single("picture"),
  dish.addDish,
);
router.put("/:id", authenticate, upload.single("picture"), dish.updateDish);

// Add endpoint for adding a dish to the cart and calculating amount
router.post("/add-to-cart", authenticate, dish.addToCart);

// Add endpoint for making an order request
router.post("/make-order", authenticate, dish.makeOrder);

export default router;
