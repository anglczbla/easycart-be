import express from "express";
import productController from "../controllers/productController.ts";
import authUser from "../middleware/auth.ts";
import {
  validateAddProduct,
  validateProductId,
  validateUpdateProduct,
} from "../middleware/validation/productValidation.ts";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProduct);
router.get("/:id", validateProductId, productController.getProductById);
router.post("/", authUser, validateAddProduct, productController.addProducts);
router.put(
  "/:id",
  authUser,
  validateUpdateProduct,
  productController.updateProduct,
);
router.delete(
  "/:id",
  authUser,
  validateProductId,
  productController.deleteProduct,
);

export default router;
