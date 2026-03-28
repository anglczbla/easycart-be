import type { Request, Response } from "express";
import fs from "fs";
import {
  getCached,
  KEYS,
  removeCached,
  setCached,
  TTL,
} from "../cache/userCache.ts";
import { cloudinary } from "../config/cloudinary.ts";
import { dbEcommerce } from "../config/db.ts";

interface Products {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

const getAllProducts = async (
  req: Request<{}, {}, Products>,
  res: Response,
) => {
  try {
    const cached = await getCached(KEYS.product);

    if (cached) {
      return res.status(200).json({
        message: "success fetch product",
        data: cached,
      });
    }

    const getProduct = await dbEcommerce.query("SELECT * FROM products");

    const result = getProduct.map((p: Products) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
      image: p.image,
    }));

    await setCached(KEYS.product, result, TTL.product);
    return res.status(201).json({
      message: "success",
      data: result,
    });
  } catch (err) {
    console.log(err);
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const cached = await getCached(KEYS.prodById(id));

    if (cached) {
      return res.status(200).json({
        message: "success fetch product",
        data: cached,
      });
    }

    const getProduct = await dbEcommerce.oneOrNone(
      "SELECT * FROM products WHERE id = $1",
      [id],
    );

    const result = {
      id: getProduct.id,
      name: getProduct.name,
      description: getProduct.description,
      price: getProduct.price,
      stock: getProduct.stock,
      category: getProduct.category,
      image: getProduct.image,
    };

    await setCached(KEYS.prodById(id), result, TTL.prodById);
    return res.status(201).json({
      message: "success",
      data: result,
    });
  } catch (err) {
    console.log(err);
    const error = err as Error;
    res
      .status(500)
      .json({ error: error.message, message: "product not found" });
  }
};

const addProducts = async (req: Request<{}, {}, Products>, res: Response) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ message: "image is required" });
    }

    const result = await cloudinary.uploader.upload(imageFile.path, {
      folder: "easycart/products",
    });

    fs.unlinkSync(imageFile.path);

    const image = result.secure_url;

    const newProducts = await dbEcommerce.one(
      "INSERT INTO products(name,description,price,stock, category, image) VALUES ($1,$2,$3,$4, $5, $6) RETURNING *",
      [name, description, price, stock, category, image],
    );

    await removeCached(KEYS.product);

    return res.status(201).json({
      message: "success add product",
      data: newProducts,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const updateProduct = async (
  req: Request<{ id: string }, {}, Products>,
  res: Response,
) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const { id } = req.params;
    const imageFile = req.file;

    let image: string | undefined;

    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path, {
        folder: "easycart/products",
      });

      fs.unlinkSync(imageFile.path);
      image = result.secure_url;
    }

    let query =
      "UPDATE products SET name=$1, description=$2, price=$3, stock=$4 ,category=$5 WHERE id =$6 RETURNING*";
    let params = [name, description, price, stock, category, id];

    if (image) {
      query =
        "UPDATE products SET name=$1, description=$2, price=$3, stock=$4 ,category=$5, image=$6 WHERE id =$7 RETURNING*";
      params = [name, description, price, stock, category, image, id];
    }

    const product = await dbEcommerce.one(query, params);

    await removeCached(KEYS.product);
    await removeCached(KEYS.prodById(id));

    return res.status(200).json({
      message: "success update product",
      data: product,
    });
  } catch (error: any) {
    console.error(error.response?.data);
    res.status(500).json({ err: error.message });
  }
};

const deleteProduct = async (
  req: Request<{ id: string }, {}, Products>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const product = await dbEcommerce.oneOrNone(
      "DELETE FROM products WHERE id=$1 RETURNING*",
      [id],
    );

    await removeCached(KEYS.product);
    await removeCached(KEYS.prodById(id));

    return res.status(200).json({
      message: "success delete product",
      data: product,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const searchProduct = async (
  req: Request<{}, {}, { product: string }>,
  res: Response,
) => {
  try {
    const { product, category } = req.query;
    const findProduct = await dbEcommerce.any(
      "SELECT * FROM products WHERE name ILIKE $1 AND category ILIKE $2",
      [`%${product}%`, `%${category}%`],
    );

    if (!findProduct) {
      return res.status(404).json({
        message: "product not found",
      });
    }

    const result = findProduct.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
    }));

    return res.status(200).json({
      message: "success",
      product: result,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
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
