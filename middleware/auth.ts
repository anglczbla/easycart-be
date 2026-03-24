import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getCached, KEYS } from "../cache/userCache.ts";
import { dbEcommerce } from "../config/db.ts";

interface JwtPayloadWithId extends jwt.JwtPayload {
  id: string;
}

export const authUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "no token" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        success: false,
        message: "not authorized please login again",
      });
    }
    const token_decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayloadWithId;

    req.userId = token_decode.id;

    const session = await getCached(KEYS.session(req.userId));

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "session expired or not found, please login again",
      });
    }
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ success: false, message: error.message });
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.userId;
    const findAdmin = await dbEcommerce.oneOrNone(
      "SELECT * FROM users WHERE id = $1 AND role = $2",
      [id, "admin"],
    );

    if (!findAdmin) {
      return res.status(401).json({
        success: false,
        message: "only admin allowed",
      });
    }
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ success: false, message: error.message });
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  }
};
