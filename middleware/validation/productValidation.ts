import type { NextFunction, Request, Response } from "express";
import z from "zod";
import { dbEcommerce } from "../../config/db.ts";

export const validateAddProduct = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const addProductSchema = z.object({
    name: z.string().min(1, "name is required"),
    description: z.string().min(1, "description is required"),
    price: z.coerce.number().min(1, "price must be a positive number"),
    stock: z.coerce
      .number()
      .int()
      .min(0, "stock must be a non-negative integer"),
    category: z.string().min(1, "category is required"),
  });

  const parsed = addProductSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }
  next();
};

export const validateUpdateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updateProductSchema = z.object({
      name: z.string().min(1, "name is required"),
      description: z.string().min(1, "description is required"),
      price: z.coerce.number().min(1, "price must be a positive number"),
      stock: z.coerce
        .number()
        .int()
        .min(0, "stock must be a non-negative integer"),
      category: z.string().min(1, "category is required"),
    });

    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "validation error",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const findProduct = await dbEcommerce.oneOrNone(
      "SELECT * FROM products where id=$1",
      [id],
    );

    if (!findProduct) {
      return res.status(404).json({
        message: "product not found",
      });
    }
    next();
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export const validateProductId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const product = await dbEcommerce.oneOrNone(
      "SELECT * FROM products where id=$1",
      [id],
    );

    if (!product) {
      return res.status(404).json({
        message: "product not found",
      });
    }
    next();
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};
