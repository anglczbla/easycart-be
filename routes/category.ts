import express from "express";
import categoryController from "../controllers/categoryController.ts";
import authUser from "../middleware/auth.ts";
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
  validateAddCategories,
  categoryController.addCategories,
);
router.put(
  "/:id",
  authUser,
  validateUpdateCategory,
  categoryController.updateCategory,
);
router.delete("/:id", authUser, categoryController.deleteCategories);

export default router;
