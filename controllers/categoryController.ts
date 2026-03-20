import type { Request, Response } from "express";
import {
  getCached,
  KEYS,
  removeCached,
  setCached,
  TTL,
} from "../cache/userCache.ts";
import { dbEcommerce } from "../config/db.ts";

interface Category {
  name: string;
}

const getAllCategories = async (
  req: Request<{}, {}, Category>,
  res: Response,
) => {
  try {
    const cached = await getCached(KEYS.categories);
    if (cached) {
      return res.status(200).json({
        message: "success fetch categories",
        data: cached,
      });
    }

    const categories = await dbEcommerce.query("SELECT * FROM categories");
    await setCached(KEYS.categories, categories, TTL.categories);
    return res.status(200).json({
      message: "success",
      data: categories,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const addCategories = async (req: Request<{}, {}, Category>, res: Response) => {
  try {
    const { name } = req.body;

    const categories = await dbEcommerce.one(
      "INSERT INTO categories (name) VALUES ($1) RETURNING*",
      [name],
    );

    await removeCached(KEYS.categories);
    return res.status(201).json({
      message: "success add categories",
      data: categories,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const deleteCategories = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const category = await dbEcommerce.oneOrNone(
      "DELETE FROM categories WHERE id=$1 RETURNING*",
      [id],
    );

    if (!category) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    await removeCached(KEYS.categories);
    await removeCached(KEYS.categoryById(id));

    return res.status(200).json({
      message: "success delete category",
      data: category,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const updateCategory = async (
  req: Request<{ id: string }, {}, Category>,
  res: Response,
) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const findCategory = await dbEcommerce.oneOrNone(
      "SELECT * FROM categories WHERE id = $1",
      [id],
    );

    if (!findCategory) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    const categories = await dbEcommerce.one(
      "UPDATE categories SET name=$1 WHERE id=$2 RETURNING*",
      [name, id],
    );

    await removeCached(KEYS.categories);
    await removeCached(KEYS.categoryById(id));
    return res.status(200).json({
      message: "success update category",
      data: categories,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const filterCategory = async (
  req: Request<{}, {}, { category: string }>,
  res: Response,
) => {
  try {
    const { category } = req.query;
    const findCategory = await dbEcommerce.any(
      "SELECT FROM categories WHERE name ILIKE $1",
      [`%${category}%`],
    );

    if (!findCategory) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    return res.status(200).json({
      message: "success",
      product: findCategory,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

export default {
  getAllCategories,
  addCategories,
  deleteCategories,
  updateCategory,
  filterCategory,
};
