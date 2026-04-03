import type { NextFunction, Request, Response } from "express";
import z from "zod";
import { dbEcommerce } from "../../config/db";

export const validateAddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { product_id, quantity } = req.body;
    const addToCartSchema = z.object({
      product_id: z.string().min(1, "id is required"),
      quantity: z.number().min(1, "qty must greater than 0"),
    });

    const parsed = addToCartSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "validation error",
        errors: parsed.error.flatten().fieldErrors,
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

    const addToCartSchema = z.object({
      product_id: z.string().min(1, "id is required"),
      quantity: z.number().min(1, "qty must greater than 0"),
    });

    const addToCartParams = z.object({
      id: z.string().min(1, "id is required"),
    });

    const addToCartUserId = z.object({
      userId: z.string().min(1, "user id is required"),
    });

    const bodyParsed = addToCartSchema.safeParse(req.body);
    const paramsParsed = addToCartParams.safeParse(req.params);
    const userIdParsed = addToCartUserId.safeParse({ userId: req.userId });

    if (!bodyParsed.success || !paramsParsed.success || !userIdParsed.success) {
      return res.status(400).json({
        errors: {
          ...bodyParsed.error?.flatten().fieldErrors,
          ...paramsParsed.error?.flatten().fieldErrors,
          ...userIdParsed.error?.flatten().fieldErrors,
        },
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

    const paramsSchema = z.object({
      id: z.string().min(1, "id is required"),
    });

    const userIdSchema = z.object({
      userId: z.string().min(1, "user id is required"),
    });

    const paramsParsed = paramsSchema.safeParse(req.params);
    const userIdParsed = userIdSchema.safeParse({ userId: req.userId });

    if (!paramsParsed.success || !userIdParsed.success) {
      return res.status(400).json({
        errors: {
          ...paramsParsed.error?.flatten().fieldErrors,
          ...userIdParsed.error?.flatten().fieldErrors,
        },
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

    next();
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};
