import type { Request, Response } from "express";
import categoryService from "../services/categoryService";

const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({
      message: "success fetch categories",
      data: categories,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const addCategories = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const category = await categoryService.addCategory({ name });

    return res.status(201).json({
      message: "success add categories",
      data: category,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const deleteCategories = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const category = await categoryService.deleteCategory(id);

    if (!category) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    return res.status(200).json({
      message: "success delete category",
      data: category,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const updateCategory = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await categoryService.updateCategory({ id, name });

    return res.status(200).json({
      message: "success update category",
      data: category,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const filterCategory = async (
  req: Request<{}, {}, {}, { category: string }>,
  res: Response,
) => {
  try {
    const { category } = req.query;
    const result = await categoryService.filterCategory(category || "");

    if (!result || result.length === 0) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    return res.status(200).json({
      message: "success",
      category: result,
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
