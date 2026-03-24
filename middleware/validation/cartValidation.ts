import type { NextFunction, Request, Response } from "express";
import { dbEcommerce } from "../../config/db.ts";

export const validateAddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { product_id, quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "quantity must be greater than 0",
        success: false,
      });
    }

    const productStock = await dbEcommerce.oneOrNone(
      "SELECT stock FROM products WHERE id = $1",
      [product_id],
    );

    if (!productStock) {
      return res.status(404).json({
        message: "product not found",
        success: false,
      });
    }

    if (productStock.stock <= 0) {
      return res.status(400).json({
        message: "out of stock",
        success: false,
      });
    }

    if (quantity > productStock.stock) {
      return res.status(400).json({
        message: `only ${productStock.stock} stock available`,
        success: false,
      });
    }

    res.locals.productStock = productStock;
    next();
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export const validateUpdateCartQty = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { product_id, quantity } = req.body;
    const userId = req.userId;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "quantity must be greater than 0",
        success: false,
      });
    }

    const cart = await dbEcommerce.oneOrNone(
      "SELECT * FROM carts WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (!cart) {
      return res.status(403).json({
        message: "forbidden",
        success: false,
      });
    }

    const product = await dbEcommerce.oneOrNone(
      "SELECT stock FROM products WHERE id = $1",
      [product_id],
    );

    if (!product) {
      return res.status(404).json({
        message: "product not found",
        success: false,
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: `only ${product.stock} stock available`,
        success: false,
      });
    }

    next();
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export const validateDeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const cart = await dbEcommerce.oneOrNone(
      "SELECT * FROM carts WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (!cart) {
      return res.status(403).json({
        message: "forbidden",
        success: false,
      });
    }

    next();
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};
