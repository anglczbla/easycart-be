import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import z from "zod";
import { dbEcommerce } from "../../config/db.ts";

export const validateRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, email } = req.body;

  const registerSchema = z.object({
    username: z
      .string()
      .min(3, "username must be at least 3 characters")
      .max(20, "username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "username can only contain letters, numbers, and underscores",
      ),
    password: z
      .string()
      .min(8, " password must be at least 8 characters")
      .regex(/[A-Z]/, "password must contain at least on uppercase letter")
      .regex(/[a-z]/, "password must contain at least one lowercase letter")
      .regex(/[0-9]/, "password must contain at least one number")
      .regex(
        /[!@#$%^&*]/,
        "password must contain at least one special character (!@#$%^&*)",
      ),
    email: z.email("invalid email format"),
  });

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const existingUser = await dbEcommerce.oneOrNone(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );

    if (existingUser?.email === email) {
      return res.status(400).json({
        errors: {
          email: ["email already exist"],
        },
      });
    }

    if (existingUser?.username === username) {
      return res.status(400).json({
        errors: {
          username: ["username already exist"],
        },
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error during validation" });
  }
};

export const validateLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  const loginSchema = z.object({
    email: z.string().min(1, "email is required"),
    password: z.string().min(1, "password is required"),
  });

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const findUser = await dbEcommerce.oneOrNone(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (!findUser) {
      return res.status(400).json({
        message: "user doesnt exist",
      });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      return res.status(401).json({ message: "wrong password" });
    }

    req.user = findUser;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error during validation" });
  }
};
