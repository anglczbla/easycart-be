import express from "express";
import authController from "../controllers/authController.ts";
import authUser from "../middleware/auth.ts";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authUser, authController.getProfile);
router.post("/logout", authUser, authController.logout);

export default router;
