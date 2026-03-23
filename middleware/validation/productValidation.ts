import type { NextFunction, Request, Response } from "express";
import { dbEcommerce } from "../../config/db.ts";

export const validateAddProduct = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, description, price, stock, category } = req.body;

  if (!name || !description || !price || !stock || !category) {
    return res.status(400).json({
      message: "all fields are required",
    });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({ message: "price must be a positive number" });
  }

  if (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock)) {
    return res
      .status(400)
      .json({ message: "stock must be a non-negative integer" });
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
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "all fields are required" });
    }

    if (typeof price !== "number" || price <= 0) {
      return res
        .status(400)
        .json({ message: "price must be a positive number" });
    }

    if (typeof stock !== "number" || stock < 0 || !Number.isInteger(stock)) {
      return res
        .status(400)
        .json({ message: "stock must be a non-negative integer" });
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
