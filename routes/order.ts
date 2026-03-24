import express from "express";
import orderController from "../controllers/orderController.ts";
import { authUser, isAdmin } from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authUser, orderController.getOrdersByUser);
router.get("/all", authUser, isAdmin, orderController.getAllOrders);
router.get("/:id", authUser, orderController.getOrderById);
router.post("/", authUser, orderController.createOrder);
router.put("/:id", authUser, isAdmin, orderController.updateOrder);

export default router;
