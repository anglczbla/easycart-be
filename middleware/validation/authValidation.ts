import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { dbEcommerce } from "../../config/db.ts";

const validateUsername = (username: string): string | null => {
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 20) return "Username must be at most 20 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return "Username can only contain letters, numbers, and underscores";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  if (!/[!@#$%^&*]/.test(password))
    return "Password must contain at least one special character (!@#$%^&*)";
  return null;
};

export const validateRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, email, password } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "invalid email format" });
  }

  const usernameError = validateUsername(username);
  if (usernameError) return res.status(400).json({ message: usernameError });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ message: passwordError });

  try {
    const existingUser = await dbEcommerce.oneOrNone(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );

    if (existingUser?.email === email) {
      return res.status(400).json({ message: "email already registered" });
    }
    if (existingUser?.username === username) {
      return res.status(400).json({ message: "username already exist" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

export const validateLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "password is required" });
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
    return res.status(500).json({ message: "server error" });
  }
};
