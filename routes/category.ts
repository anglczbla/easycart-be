import express from "express";
import categoryController from "../controllers/categoryController.ts";
import authUser from "../middleware/auth.ts";

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/search", categoryController.filterCategory);
router.post("/", authUser, categoryController.addCategories);
router.put("/:id", authUser, categoryController.updateCategory);
router.delete("/:id", authUser, categoryController.deleteCategories);

export default router;
