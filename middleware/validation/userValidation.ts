import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const updateProfileSchema = z.object({
  email: z.string().email("invalid email format").optional(),
  username: z.string().min(3, "username min 3 characters").optional(),
  phone: z.string().min(10, "phone min 10 characters").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

const updateImageSchema = z.object({
  avatar: z.string().optional(),
});

export const validateUpdateProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.body);
  const parsed = updateProfileSchema.safeParse(req.body ?? {});
  const parsedFile = updateImageSchema.safeParse(req.file ?? {});

  if (!parsed.success || !parsedFile.success) {
    return res.status(400).json({
      message: "validation error",
      errors: {
        ...parsed.error?.flatten().fieldErrors,
        ...parsedFile.error?.flatten().fieldErrors,
      },
    });
  }

  next();
};
