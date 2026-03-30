import type { Request, Response } from "express";
import fs from "fs";
import {
  getCached,
  KEYS,
  removeCached,
  setCached,
  TTL,
} from "../cache/userCache.ts";
import { cloudinary } from "../config/cloudinary.ts";
import { dbEcommerce } from "../config/db.ts";

interface Users {
  id: string;
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

    const cached = await getCached(KEYS.userById(id));

    if (cached) {
      return res.status(200).json({ data: cached });
    }

    const getUser = await dbEcommerce.oneOrNone(
      "SELECT * FROM users where id=$1",
      [id],
    );

    if (!getUser) {
      return res.status(404).json({ message: "user not found" });
    }

    const result = {
      id: getUser.id,
      email: getUser.email,
      username: getUser.username,
      role: getUser.role,
      phone: getUser.phone,
      address: getUser.address,
      city: getUser.city,
      avatar: getUser.avatar,
    };

    await setCached(KEYS.userById(id), result, TTL.userById);
    return res.status(200).json({ data: result });
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

    const { email, username, phone, address, city } = req.body;

    const imageFile = req.file;

    let avatar: string | undefined;

    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path, {
        folder: "easycart/avatars",
      });
      fs.unlinkSync(imageFile.path);
      avatar = result.secure_url;
    }

    let query =
      "UPDATE users SET email=$1, username=$2, phone=$3, address=$4, city=$5 WHERE id=$6 RETURNING *";
    let params = [email, username, phone, address, city, id];

    if (avatar) {
      query =
        "UPDATE users SET email=$1, username=$2, phone=$3, address=$4, city=$5, avatar=$6 WHERE id=$7 RETURNING *";
      params = [email, username, phone, address, city, avatar, id];
    }

    const newProfile = await dbEcommerce.one(query, params);

    const result = {
      id: newProfile.id,
      email: newProfile.email,
      username: newProfile.username,
      phone: newProfile.phone,
      address: newProfile.address,
      city: newProfile.city,
      avatar: newProfile.avatar,
    };

    await removeCached(KEYS.userById(id));
    return res.status(201).json({
      message: "success update profile",
      data: result,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

export default { getProfile, updateProfile };
