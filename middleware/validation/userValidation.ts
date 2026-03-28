import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const updateProfileSchema = z.object({
  email: z.string().email("invalid email format").optional(),
  username: z.string().min(3, "username min 3 characters").optional(),
  phone: z.string().min(10, "phone min 10 characters").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export const validateUpdateProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  next();
};
