import type { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateCreateReview = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const createReviewSchema = z.object({
    comment: z.string().optional(),
    rating: z.coerce
      .number()
      .int()
      .min(1, "rating is required")
      .max(5, "rating max 5"),
    image: z.string().optional(),
    product_id: z.string().min(1, "product id is required"),
  });

  const parsed = createReviewSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }
  next();
};

export const validateUpdateReview = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const updateReviewSchema = z.object({
    comment: z.string().optional(),
    rating: z.coerce.number().int().min(1).max(5, "rating max 5").optional(),
  });

  const parsed = updateReviewSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }
  next();
};
