import type { NextFunction, Request, Response } from "express";
import { dbEcommerce } from "../../config/db.ts";

export const validateAddCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;

    const duplicateName = await dbEcommerce.oneOrNone(
      "SELECT * FROM categories WHERE name = $1",
      [name],
    );

    if (duplicateName) {
      return res.status(400).json({
        message: "category already exist",
        success: false,
      });
    }
    next();
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export const validateUpdateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const findCategory = await dbEcommerce.oneOrNone(
      "SELECT * FROM categories WHERE id = $1",
      [id],
    );

    if (!findCategory) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    const duplicateName = await dbEcommerce.oneOrNone(
      "SELECT * FROM categories WHERE name = $1",
      [name],
    );

    if (duplicateName && duplicateName.id !== id) {
      return res.status(400).json({
        message: "category already exist",
        success: false,
      });
    }
    next();
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};
