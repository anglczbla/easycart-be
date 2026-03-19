import express from "express";
import userController from "../controllers/userController.ts";
import authUser from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authUser, userController.getProfile);

export default router;
