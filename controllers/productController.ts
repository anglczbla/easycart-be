import type { Request, Response } from "express";
import {
  getCached,
  KEYS,
  removeCached,
  setCached,
  TTL,
} from "../cache/userCache.ts";
import { dbEcommerce } from "../config/db.ts";

interface Products {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
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

    await setCached(KEYS.product, getProduct, TTL.product);
    return res.status(201).json({
      message: "success",
      data: getProduct,
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

    await setCached(KEYS.prodById(id), getProduct, TTL.prodById);
    return res.status(201).json({
      message: "success",
      data: getProduct,
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

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }
    const newProducts = await dbEcommerce.one(
      "INSERT INTO products(name,description,price,stock, category) VALUES ($1,$2,$3,$4, $5) RETURNING *",
      [name, description, price, stock, category],
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

    const findProduct = await dbEcommerce.oneOrNone(
      "SELECT * FROM products where id=$1",
      [id],
    );

    if (!findProduct) {
      return res.status(404).json({
        message: "product not found",
      });
    }

    const product = await dbEcommerce.one(
      "UPDATE products SET name=$1, description=$2, price=$3, stock=$4 ,category=$5 WHERE id =$6 RETURNING*",
      [name, description, price, stock, category, id],
    );

    await removeCached(KEYS.product);
    await removeCached(KEYS.prodById(id));

    return res.status(200).json({
      message: "success update product",
      data: product,
    });
  } catch (error: any) {
    // const error = err as Error;
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

    if (!product) {
      return res.status(404).json({
        message: "product not found",
      });
    }

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
    const { product } = req.query;
    const findProduct = await dbEcommerce.any(
      "SELECT * FROM products WHERE name ILIKE $1",
      [`%${product}%`],
    );

    if (!findProduct) {
      return res.status(404).json({
        message: "product not found",
      });
    }

    return res.status(200).json({
      message: "success",
      product: findProduct,
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
