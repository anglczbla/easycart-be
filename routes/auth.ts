import express from "express";
import authController from "../controllers/authController.ts";
import { authUser } from "../middleware/auth.ts";
import {
  validateLogin,
  validateRegister,
} from "../middleware/validation/authValidation.ts";

const router = express.Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/logout", authUser, authController.logout);

export default router;
