import express from "express";
import userController from "../controllers/userController";
import { authUser } from "../middleware/auth";
import upload from "../middleware/multer";
import { validateUpdateProfile } from "../middleware/validation/userValidation";

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
