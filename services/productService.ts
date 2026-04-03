import fs from "fs";
import {
  getCached,
  KEYS,
  removeCached,
  setCached,
  TTL,
} from "../cache/userCache";
import { cloudinary } from "../config/cloudinary";
import { dbEcommerce } from "../config/db";
import type {
  CreateProductDTO,
  Product,
  UpdateProductDTO,
} from "../types/product";

const getAllProducts = async (): Promise<Product[]> => {
  const cached = await getCached(KEYS.product);
  if (cached) return cached;

  const getProduct = await dbEcommerce.query("SELECT * FROM products");

  const result = getProduct.map((p: Product) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category: p.category,
    image: p.image,
  }));

  await setCached(KEYS.product, result, TTL.product);
  return result;
};

const getProductById = async (id: string): Promise<Product | null> => {
  const cached = await getCached(KEYS.prodById(id));
  if (cached) return cached;

  const getProduct = await dbEcommerce.oneOrNone(
    "SELECT * FROM products WHERE id = $1",
    [id],
  );

  if (!getProduct) return null;

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
  return result;
};

const addProducts = async (data: CreateProductDTO): Promise<Product> => {
  const { name, description, price, stock, category, imageFile } = data;

  if (!imageFile) {
    throw new Error("image is required");
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
  return newProducts;
};

const updateProduct = async (data: UpdateProductDTO): Promise<Product> => {
  const { id, name, description, price, stock, category, imageFile } = data;
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

  return product;
};

const deleteProduct = async (id: string): Promise<Product | null> => {
  const product = await dbEcommerce.oneOrNone(
    "DELETE FROM products WHERE id=$1 RETURNING*",
    [id],
  );

  if (product) {
    await removeCached(KEYS.product);
    await removeCached(KEYS.prodById(id));
  }

  return product;
};

const searchProduct = async (
  product: string,
  category: string,
): Promise<Product[]> => {
  const findProduct = await dbEcommerce.any(
    "SELECT * FROM products WHERE name ILIKE $1 AND category ILIKE $2",
    [`%${product}%`, `%${category}%`],
  );

  return findProduct.map((p: Product) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category: p.category,
    image: p.image,
  }));
};

export default {
  getAllProducts,
  getProductById,
  addProducts,
  updateProduct,
  deleteProduct,
  searchProduct,
};
