import express from "express";
import orderController from "../controllers/orderController";
import { authUser, isAdmin } from "../middleware/auth";
import upload from "../middleware/multer";
import {
  validateGetOrderById,
  validateUpdateOrder,
  validateUserId,
} from "../middleware/validation/orderValidation";

const router = express.Router();

router.get("/", authUser, validateUserId, orderController.getOrdersByUser);
router.get("/all", authUser, isAdmin, orderController.getAllOrders);
router.get(
  "/:id",
  authUser,
  validateGetOrderById,
  orderController.getOrderById,
);
router.post(
  "/",
  authUser,
  validateUserId,
  upload.single("image"),
  orderController.createOrder,
);
router.put(
  "/:id",
  authUser,
  validateUpdateOrder,
  isAdmin,
  orderController.updateOrder,
);

export default router;
