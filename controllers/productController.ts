import type { Request, Response } from "express";
import productService from "../services/productService.ts";

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).json({
      message: "success fetch product",
      data: products,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    return res.status(200).json({
      message: "success fetch product",
      data: product,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const addProducts = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const imageFile = req.file;

    const newProduct = await productService.addProducts({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      imageFile,
    });

    return res.status(201).json({
      message: "success add product",
      data: newProduct,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;
    const imageFile = req.file;

    const updatedProduct = await productService.updateProduct({
      id,
      name,
      description,
      price: price ? Number(price) : undefined,
      stock: stock ? Number(stock) : undefined,
      category,
      imageFile,
    });

    return res.status(200).json({
      message: "success update product",
      data: updatedProduct,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productService.deleteProduct(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "product not found" });
    }

    return res.status(200).json({
      message: "success delete product",
      data: deletedProduct,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const searchProduct = async (req: Request, res: Response) => {
  try {
    const { product, category } = req.query;
    const result = await productService.searchProduct(
      product as string || "",
      category as string || ""
    );

    return res.status(200).json({
      message: "success",
      product: result,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllProducts,
  getProductById,
  addProducts,
  updateProduct,
  deleteProduct,
  searchProduct,
};
