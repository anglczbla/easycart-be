import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { KEYS, removeCached, setCached, TTL } from "../cache/userCache.ts";
import { dbEcommerce } from "../config/db.ts";

interface Register {
  username: string;
  email: string;
  password: string;
}

interface Login {
  email: string;
  password: string;
}

const register = async (req: Request<{}, {}, Register>, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await dbEcommerce.one(
      "INSERT INTO users(username,email,password) VALUES ($1,$2,$3) RETURNING id, username, email, phone, address, city, avatar",
      [username, email, hashedPassword],
    );

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    return res.status(201).json({
      message: "success",
      data: {
        data: newUser,
        token,
      },
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const login = async (req: Request<{}, {}, Login>, res: Response) => {
  try {
    const findUser = req.user;

    const token = jwt.sign(
      { id: findUser.id, email: findUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    await setCached(KEYS.session(findUser.id), findUser, TTL.session);

    return res.status(200).json({
      message: "success",
      data: findUser,
      token,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req: Request, res: Response) => {
  const { userId } = req;
  if (!userId) {
    return res.status(401).json({ message: "user not found" });
  }

  await removeCached(KEYS.session(userId));
  return res.status(200).json({ message: "logout success" });
};

export default { register, login, logout };
