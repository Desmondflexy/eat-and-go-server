import express from "express";
import * as dish from "../controllers/dishes";
import { authenticate, isVendor } from "../middleware/authentication";

const router = express.Router();

router.get("/", authenticate, dish.getAllDishes);
router.get("/:id", authenticate, dish.getDish);
router.delete("/:id", authenticate, dish.deleteDish);
router.post("/", authenticate, isVendor, dish.addDish);
router.put("/:id", authenticate, dish.updateDish);

export default router;
