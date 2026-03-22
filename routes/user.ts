import express from "express";
import userController from "../controllers/userController.ts";
import authUser from "../middleware/auth.ts";

const router = express.Router();

router.get("/", authUser, userController.getProfile);
router.put("/", authUser, userController.updateProfile);

export default router;
