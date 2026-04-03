import type { NextFunction, Request, Response } from "express";
import z from "zod";
import { dbEcommerce } from "../../config/db";

export const validateAddCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;
    const addCategorySchema = z.object({
      name: z.string().min(1, "name is required"),
    });

    const parsed = addCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "validation error",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

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

    const bodySchema = z.object({
      name: z.string().min(1, "name is required"),
    });

    const paramsSchema = z.object({
      id: z.string().min(1, "id is required"),
    });

    const bodyParsed = bodySchema.safeParse(req.body);
    const paramsParsed = paramsSchema.safeParse(req.params);

    if (!bodyParsed.success || !paramsParsed.success) {
      return res.status(400).json({
        errors: {
          ...bodyParsed.error?.flatten().fieldErrors,
          ...paramsParsed.error?.flatten().fieldErrors,
        },
      });
    }

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
