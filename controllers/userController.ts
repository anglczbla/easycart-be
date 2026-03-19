import type { Request, Response } from "express";
import { getCached, KEYS, removeCached } from "../cache/userCache.ts";
import { dbEcommerce } from "../config/db.ts";

interface Users {
  email: string;
  username: string;
  password: string;
  phone: string;
  address: string;
  city: string;
  avatar: string;
}

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

const updateProfile = async (
  req: Request<{ id: string }, {}, Users>,
  res: Response,
) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const { email, username, password, phone, address, city, avatar } =
      req.body;

    if (
      !email ||
      !username ||
      !password ||
      !phone ||
      !address ||
      !city ||
      !avatar
    ) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }

    const newProfile = await dbEcommerce.one(
      "UPDATE users (email, username, password, phone,address, city, avatar) SET VALUES ($1,$2,$3,$4,$5,$6,$7) WHERE id =$8 RETURNING *",
      [email, username, password, phone, address, city, avatar, id],
    );

    await removeCached(KEYS.session(id));
    return res.status(201).json({
      message: "success add product",
      data: newProfile,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

export default { getProfile, updateProfile };
