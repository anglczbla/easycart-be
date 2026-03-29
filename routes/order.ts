import express from "express";
import orderController from "../controllers/orderController.ts";
import { authUser, isAdmin } from "../middleware/auth.ts";
import {
  validateGetOrderById,
  validateUpdateOrder,
  validateUserId,
} from "../middleware/validation/orderValidation.ts";

const router = express.Router();

router.get("/", authUser, validateUserId, orderController.getOrdersByUser);
router.get("/all", authUser, isAdmin, orderController.getAllOrders);
router.get(
  "/:id",
  authUser,
  validateGetOrderById,
  orderController.getOrderById,
);
router.post("/", authUser, validateUserId, orderController.createOrder);
router.put(
  "/:id",
  authUser,
  validateUpdateOrder,
  isAdmin,
  orderController.updateOrder,
);

export default router;
