import express from "express";
import cartController from "../controllers/cartController.ts";
import authUser from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authUser, cartController.getCartById);
router.post("/", authUser, cartController.addToCart);
router.put("/:id", authUser, cartController.updateCartQty);
router.delete("/:id", authUser, cartController.deleteCart);

export default router;
