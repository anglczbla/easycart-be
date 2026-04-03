import { getCached, KEYS, removeCached, setCached, TTL } from "../cache/userCache.ts";
import { dbEcommerce } from "../config/db.ts";
import type { AddToCartDTO, CartItem, DeleteCartDTO, UpdateCartDTO } from "../types/cart.ts";

const getCartByUserId = async (userId: string): Promise<CartItem[]> => {
  const cached = await getCached(KEYS.cartById(userId));
  if (cached) return cached;

  const findCart = await dbEcommerce.manyOrNone(
    `SELECT 
      carts.id AS cart_id,
      cart_items.id AS cart_item_id,
      products.name,
      products.price,
      products.image,
      cart_items.quantity,
      products.id AS product_id
    FROM cart_items
    JOIN products ON cart_items.product_id = products.id
    JOIN carts ON cart_items.cart_id = carts.id
    WHERE carts.user_id = $1`,
    [userId],
  );

  await setCached(KEYS.cartById(userId), findCart || [], TTL.cartById);
  return findCart || [];
};

const addToCart = async (data: AddToCartDTO): Promise<void> => {
  const { userId, product_id, quantity } = data;

  const item = await dbEcommerce.oneOrNone(
    "SELECT * FROM carts WHERE user_id = $1 LIMIT 1",
    [userId],
  );

  let idCart;
  if (item == null) {
    idCart = await dbEcommerce.one(
      "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
      [userId],
    );
  } else {
    idCart = item;
  }

  const existingItem = await dbEcommerce.oneOrNone(
    "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 LIMIT 1",
    [idCart.id, product_id],
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    await dbEcommerce.none(
      "UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3",
      [newQty, idCart.id, product_id],
    );
  } else {
    await dbEcommerce.one(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [idCart.id, product_id, quantity],
    );
  }

  await removeCached(KEYS.cartById(userId));
};

const updateCartQty = async (data: UpdateCartDTO): Promise<any> => {
  const { userId, cartId, product_id, quantity } = data;

  const cart = await dbEcommerce.oneOrNone(
    "UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *",
    [quantity, cartId, product_id],
  );

  if (cart) {
    await removeCached(KEYS.cartById(userId));
  }
  return cart;
};

const deleteCartItem = async (data: DeleteCartDTO): Promise<any> => {
  const { userId, cartId, product_id } = data;

  const cart = await dbEcommerce.oneOrNone(
    "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *",
    [cartId, product_id],
  );

  if (cart) {
    await removeCached(KEYS.cartById(userId));
  }
  return cart;
};

export default {
  getCartByUserId,
  addToCart,
  updateCartQty,
  deleteCartItem,
};
