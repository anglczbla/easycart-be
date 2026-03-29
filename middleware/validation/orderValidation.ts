import type { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const getOrderSchema = z.object({
    userId: z.string().min(1, "id is required"),
  });

  const parsed = getOrderSchema.safeParse({ userId: req.userId });
  if (!parsed.success) {
    return res.status(400).json({
      message: "validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }
  next();
};

export const validateGetOrderById = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  const getOrderByIdSchema = z.object({
    id: z.string().min(1, "id is required"),
  });

  const parsed = getOrderByIdSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      message: "validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }
  next();
};

export const validateUpdateOrder = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  const updateOrderSchemaParams = z.object({
    id: z.string().min(1, "id is required"),
  });

  const updateOrderSchema = z.object({
    status: z.string().min(1, "status is required"),
  });

  const bodyParsed = updateOrderSchema.safeParse(req.body);
  const paramsParsed = updateOrderSchemaParams.safeParse(req.params);

  if (!bodyParsed.success || !paramsParsed.success) {
    return res.status(400).json({
      errors: {
        ...bodyParsed.error?.flatten().fieldErrors,
        ...paramsParsed.error?.flatten().fieldErrors,
      },
    });
  }

  if (!id) {
    return res.status(404).json({
      message: "orders not found",
      status: false,
    });
  }
  next();
};
