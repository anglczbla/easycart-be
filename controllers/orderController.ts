import type { Request, Response } from "express";
import orderService from "../services/orderService";
import userService from "../services/userService";
import cartService from "../services/cartService";

const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getAllOrders();
    return res.status(200).json({
      message: "success fetch order",
      data: orders,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const id = req.userId;
    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }
    const orders = await orderService.getOrdersByUser(id);

    return res.status(200).json({
      message: "success fetch orders",
      data: orders,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const getOrderById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    return res.status(200).json({
      message: "success fetch order",
      data: order,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const createOrder = async (req: Request, res: Response) => {
  try {
    const id = req.userId;
    const imageFile = req.file;

    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    if (!imageFile) {
      return res.status(400).json({ message: "image is required" });
    }

    const findAddress = await userService.getProfile(id);

    if (!findAddress || !findAddress.address || !findAddress.city) {
      return res
        .status(404)
        .json({ message: "address not found, should add address on profile" });
    }

    const cartItems = await cartService.getCartByUserId(id);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "cart is empty" });
    }

    await orderService.createOrder({
      userId: id,
      imageFile,
      address: findAddress.address,
      city: findAddress.city,
      cartItems,
    });

    return res.status(201).json({
      message: "success create order",
      success: true,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const updateOrder = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrder({
      orderId: id,
      status,
    });

    return res.status(200).json({
      message: "success update order",
      data: order,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export default {
  getOrdersByUser,
  createOrder,
  getAllOrders,
  updateOrder,
  getOrderById,
};
