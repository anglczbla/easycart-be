import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getCached, KEYS } from "../cache/userCache.ts";

interface JwtPayloadWithId extends jwt.JwtPayload {
  id: string;
}

const authUser = async (req: Request, res: Response, next: NextFunction) => {
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

export default authUser;
