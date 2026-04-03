import type { Request, Response } from "express";
import userService from "../services/userService";

const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const result = await userService.register({ username, email, password });

    return res.status(201).json({
      message: "success",
      data: {
        data: result.user,
        token: result.token,
      },
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const findUser = req.user;
    const result = await userService.login(findUser);

    return res.status(200).json({
      message: "success",
      data: result.user,
      token: result.token,
    });
  } catch (err) {
    const error = err as Error;
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ message: "unauthorized" });
    }

    await userService.logout(userId);
    return res.status(200).json({ message: "logout success" });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export default { register, login, logout };
