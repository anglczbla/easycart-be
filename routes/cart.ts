import express from "express";
import cartController from "../controllers/cartController";
import { authUser } from "../middleware/auth";
import {
  validateAddToCart,
  validateDeleteCart,
  validateUpdateCartQty,
} from "../middleware/validation/cartValidation";

const router = express.Router();

router.get("/", authUser, cartController.getCartById);
router.post("/", authUser, validateAddToCart, cartController.addToCart);
router.put(
  "/:id",
  authUser,
  validateUpdateCartQty,
  cartController.updateCartQty,
);
router.delete("/:id", authUser, validateDeleteCart, cartController.deleteCart);

export default router;
