import express from "express";
import productController from "../controllers/productController";
import { authUser, isAdmin } from "../middleware/auth";
import upload from "../middleware/multer";
import {
  validateAddProduct,
  validateProductId,
  validateUpdateProduct,
} from "../middleware/validation/productValidation";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProduct);
router.get("/:id", validateProductId, productController.getProductById);
router.post(
  "/",
  authUser,
  isAdmin,
  upload.single("image"),
  validateAddProduct,
  productController.addProducts,
);
router.put(
  "/:id",
  authUser,
  isAdmin,
  upload.single("image"),
  validateUpdateProduct,
  productController.updateProduct,
);
router.delete(
  "/:id",
  authUser,
  isAdmin,
  validateProductId,
  productController.deleteProduct,
);

export default router;
