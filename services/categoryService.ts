import {
  getCached,
  KEYS,
  removeCached,
  setCached,
  TTL,
} from "../cache/userCache";
import { dbEcommerce } from "../config/db";
import type {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../types/category";

const getAllCategories = async (): Promise<Category[]> => {
  const cached = await getCached(KEYS.categories);
  if (cached) return cached;

  const categories = await dbEcommerce.query("SELECT * FROM categories");

  const result = categories.map((c: Category) => ({
    id: c.id,
    name: c.name,
  }));

  await setCached(KEYS.categories, result, TTL.categories);
  return result;
};

const addCategory = async (data: CreateCategoryDTO): Promise<Category> => {
  const { name } = data;
  const category = await dbEcommerce.one(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
    [name],
  );

  await removeCached(KEYS.categories);
  return category;
};

const updateCategory = async (data: UpdateCategoryDTO): Promise<Category> => {
  const { id, name } = data;
  const category = await dbEcommerce.one(
    "UPDATE categories SET name=$1 WHERE id=$2 RETURNING *",
    [name, id],
  );

  await removeCached(KEYS.categories);
  await removeCached(KEYS.categoryById(id));
  return category;
};

const deleteCategory = async (id: string): Promise<Category | null> => {
  const category = await dbEcommerce.oneOrNone(
    "DELETE FROM categories WHERE id=$1 RETURNING *",
    [id],
  );

  if (category) {
    await removeCached(KEYS.categories);
    await removeCached(KEYS.categoryById(id));
  }
  return category;
};

const filterCategory = async (categoryName: string): Promise<Category[]> => {
  const findCategory = await dbEcommerce.any(
    "SELECT * FROM categories WHERE name ILIKE $1",
    [`%${categoryName}%`],
  );

  return findCategory.map((c: Category) => ({
    id: c.id,
    name: c.name,
  }));
};

export default {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  filterCategory,
};
