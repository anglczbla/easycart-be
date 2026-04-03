import type { Request, Response } from "express";
import cartService from "../services/cartService.ts";

const getCartById = async (req: Request, res: Response) => {
  try {
    const id = req.userId;
    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const cart = await cartService.getCartByUserId(id);

    return res.status(200).json({
      message: "success fetch cart",
      data: cart,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const addToCart = async (req: Request, res: Response) => {
  try {
    const id = req.userId;
    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }
    const { product_id, quantity } = req.body;

    await cartService.addToCart({
      userId: id,
      product_id,
      quantity: Number(quantity),
    });

    return res.status(201).json({
      message: "success add product",
      success: true,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const updateCartQty = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, product_id } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const cart = await cartService.updateCartQty({
      userId,
      cartId: id,
      product_id,
      quantity: Number(quantity),
    });

    if (!cart) {
      return res.status(404).json({ message: "cart item not found" });
    }

    return res.status(200).json({
      message: "success update cart",
      data: cart,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const deleteCart = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { product_id } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const cart = await cartService.deleteCartItem({
      userId,
      cartId: id,
      product_id,
    });

    if (!cart) {
      return res.status(404).json({ message: "cart item not found" });
    }

    return res.status(200).json({
      message: "success delete product",
      data: cart,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export default {
  getCartById,
  addToCart,
  deleteCart,
  updateCartQty,
};
