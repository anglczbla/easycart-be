import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getCached, KEYS, setCached, TTL } from "../cache/userCache.ts";
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

    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "invalid email" });
    }
    if (!password) {
      return res.status(400).json({ message: "invalid password" });
    }

    const existingUser = await dbEcommerce.oneOrNone(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser) {
      return res.status(400).json({ message: "email already registered" });
    }

    const duplicateUsername = await dbEcommerce.oneOrNone(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );

    if (duplicateUsername) {
      return res.status(400).json({ message: "username already exist" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await dbEcommerce.one(
      "INSERT INTO users(username,email,password) VALUES ($1,$2,$3) RETURNING *",
      [username, email, hashedPassword],
    );

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    const newUserRegist = {
      data: newUser,
      token,
    };

    return res.status(201).json({
      message: "success",
      data: newUserRegist,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const login = async (req: Request<{}, {}, Login>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "password is required" });
    }

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

const getProfile = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const cached = await getCached(KEYS.session(id));

    if (cached) {
      return res.status(200).json({ data: cached });
    }

    const getUser = await dbEcommerce.one("SELECT * FROM users where id=$1", [
      id,
    ]);
    return res.status(200).json({ data: getUser });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export default { register, login, getProfile };
