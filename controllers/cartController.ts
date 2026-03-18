import type { Request, Response } from "express";
import {
  getCached,
  KEYS,
  removeCached,
  setCached,
  TTL,
} from "../cache/userCache.ts";
import { dbEcommerce } from "../config/db.ts";

interface Cart {
  cart_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

const getCartById = async (
  req: Request<{ id: string }, {}, Cart>,
  res: Response,
) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const cached = await getCached(KEYS.cartById(id));
    console.log("cached", cached);
    if (cached) {
      return res.status(200).json({
        message: "success fetch cart",
        data: cached,
      });
    }
    const findCart = await dbEcommerce.manyOrNone(
      `SELECT 
        carts.id AS cart_id,
        cart_items.id AS item_id,
        cart_items.product_id,
        cart_items.quantity,
        products.name,
        products.price
      FROM carts
      JOIN cart_items ON carts.id = cart_items.cart_id
      JOIN products ON cart_items.product_id = products.id
      WHERE carts.user_id = $1`,
      [id],
    );

    if (!findCart || findCart.length === 0) {
      return res.status(200).json({
        message: "success fetch cart",
        data: findCart ?? [],
      });
    }

    await setCached(KEYS.cartById(id), findCart, TTL.cartById);

    return res.status(200).json({
      message: "success fetch cart",
      data: findCart,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const addToCart = async (
  req: Request<{ id: string }, {}, Cart>,
  res: Response,
) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const item = await dbEcommerce.oneOrNone(
      "SELECT * FROM carts where user_id = $1 LIMIT 1",
      [id],
    );

    let idCart;

    if (item == null) {
      idCart = await dbEcommerce.one(
        "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
        [id],
      );
    } else {
      idCart = item;
    }

    const { product_id } = req.body;

    const productStock = await dbEcommerce.oneOrNone(
      "SELECT stock FROM products WHERE id = $1",
      [product_id],
    );

    if (!productStock) {
      return res.status(400).json({
        message: "product not found",
        success: false,
      });
    }

    if (productStock.stock <= 0) {
      return res.status(400).json({
        message: "out of stock",
        success: false,
      });
    }

    const existingItem = await dbEcommerce.oneOrNone(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 LIMIT 1",
      [idCart.id, product_id],
    );

    if (existingItem) {
      await dbEcommerce.none(
        "UPDATE cart_items SET quantity = quantity + 1 WHERE cart_id = $1 AND product_id = $2",
        [idCart.id, product_id],
      );
    } else {
      await dbEcommerce.one(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1,$2,$3) RETURNING *",
        [idCart.id, product_id, 1],
      );
    }

    await dbEcommerce.none(
      "UPDATE products SET stock = stock - 1 WHERE id = $1",
      [product_id],
    );

    await removeCached(KEYS.product);
    await removeCached(KEYS.prodById(product_id));
    await removeCached(KEYS.cart);
    await removeCached(KEYS.cartById(id));

    return res.status(201).json({
      message: "success add product",
      success: true,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const updateCartQty = async (
  req: Request<{ id: string }, {}, Cart>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { quantity, product_id } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const cart = await dbEcommerce.any(
      "UPDATE cart_items SET quantity=$1 WHERE cart_id=$2 AND product_id=$3 RETURNING *",
      [quantity, id, product_id],
    );

    if (cart.length === 0) {
      return res.status(404).json({
        message: "cart item not found",
      });
    }

    await removeCached(KEYS.cart);
    await removeCached(KEYS.cartById(userId));

    return res.status(200).json({
      message: "success update cart",
      data: cart[0],
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

const deleteCart = async (
  req: Request<{ id: string }, {}, Cart>,
  res: Response,
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const { id } = req.params;
    const { product_id } = req.body;
    const cart = await dbEcommerce.any(
      "DELETE FROM cart_items WHERE cart_id = $1 AND product_id=$2 RETURNING *",
      [id, product_id],
    );

    if (cart.length === 0) {
      return res.status(404).json({
        message: "cart not found",
      });
    }

    await removeCached(KEYS.cart);
    await removeCached(KEYS.cartById(userId));

    return res.status(200).json({
      message: "success delete product",
      data: cart[0],
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ err: error.message });
  }
};

export default {
  getCartById,
  addToCart,
  deleteCart,
  updateCartQty,
};
