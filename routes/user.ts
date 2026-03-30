import express from "express";
import userController from "../controllers/userController.ts";
import { authUser } from "../middleware/auth.ts";
import upload from "../middleware/multer.ts";
import { validateUpdateProfile } from "../middleware/validation/userValidation.ts";

const router = express.Router();

router.get("/", authUser, userController.getProfile);
router.put(
  "/",
  authUser,
  upload.single("avatar"),
  validateUpdateProfile,
  userController.updateProfile,
);

export default router;
