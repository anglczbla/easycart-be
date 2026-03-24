import express from "express";
import categoryController from "../controllers/categoryController.ts";
import { authUser, isAdmin } from "../middleware/auth.ts";
import {
  validateAddCategories,
  validateUpdateCategory,
} from "../middleware/validation/categoryValidation.ts";

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/search", categoryController.filterCategory);
router.post(
  "/",
  authUser,
  isAdmin,
  validateAddCategories,
  categoryController.addCategories,
);
router.put(
  "/:id",
  authUser,
  isAdmin,
  validateUpdateCategory,
  categoryController.updateCategory,
);
router.delete("/:id", authUser, isAdmin, categoryController.deleteCategories);

export default router;
