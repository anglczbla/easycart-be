import type { Request, Response } from "express";
import userService from "../services/userService";

const getProfile = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const user = await userService.getProfile(id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json({ data: user });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const { email, username, phone, address, city } = req.body;
    const imageFile = req.file;

    const updatedUser = await userService.updateProfile({
      id,
      email,
      username,
      phone,
      address,
      city,
      imageFile,
    });

    return res.status(201).json({
      message: "success update profile",
      data: updatedUser,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

export default { getProfile, updateProfile };
