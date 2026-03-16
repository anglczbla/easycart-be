import express from "express";
import productController from "../controllers/productController.ts";
import authUser from "../middleware/auth.ts";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getAllProducts);
router.post("/", authUser, productController.addProducts);
router.put("/:id", authUser, productController.updateProduct);
router.delete("/:id", authUser, productController.deleteProduct);

export default router;
