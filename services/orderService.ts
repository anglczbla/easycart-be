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
import type { CreateOrderDTO, Order, UpdateOrderDTO } from "../types/order";

const getAllOrders = async (): Promise<Order[]> => {
  const cached = await getCached(KEYS.order);
  if (cached) return cached;

  const getOrder = await dbEcommerce.query(
    `SELECT 
      orders.*, 
      order_items.quantity, 
      products.name as product_name,
      products.image as product_image,
      users.username as customer_name
    FROM orders 
    JOIN order_items ON orders.id = order_items.order_id 
    JOIN products ON order_items.product_id = products.id
    JOIN users ON orders.user_id = users.id`,
  );
  await setCached(KEYS.order, getOrder, TTL.order);
  return getOrder;
};

const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  const cached = await getCached(KEYS.orderById(userId));
  if (cached) return cached;

  const orders = await dbEcommerce.manyOrNone(
    `SELECT 
      orders.*, 
      order_items.quantity, 
      products.name as product_name,
      products.image as product_image
    FROM orders 
    JOIN order_items ON orders.id = order_items.order_id 
    JOIN products ON order_items.product_id = products.id 
    WHERE orders.user_id = $1`,
    [userId],
  );

  await setCached(KEYS.orderById(userId), orders || [], TTL.orderById);
  return orders || [];
};

const getOrderById = async (orderId: string): Promise<any> => {
  const order = await dbEcommerce.oneOrNone(
    "SELECT * FROM orders WHERE id = $1",
    [orderId],
  );

  if (!order) return null;

  const orderItems = await dbEcommerce.manyOrNone(
    `SELECT 
      order_items.id,
      order_items.order_id,
      order_items.product_id,
      order_items.quantity,
      order_items.price,
      products.name as product_name,
      products.image as product_image
    FROM order_items
    JOIN products ON order_items.product_id = products.id
    WHERE order_items.order_id = $1`,
    [orderId],
  );

  return { ...order, items: orderItems };
};

const createOrder = async (data: CreateOrderDTO): Promise<void> => {
  const { userId, imageFile, address, city, cartItems } = data;

  const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
    folder: "easycart/products",
  });

  fs.unlinkSync(imageFile.path);

  const imageUrl = uploadResult.secure_url;

  const totalPrice = cartItems.reduce(
    (acc: number, item: any) => acc + Number(item.price) * Number(item.quantity),
    0,
  );

  const cartId = cartItems[0].cart_id;

  await dbEcommerce.tx(async (t) => {
    const order = await t.one(
      "INSERT INTO orders(user_id, total_price, status, shipping_address, image) VALUES($1, $2, $3, $4, $5) RETURNING id",
      [
        userId,
        totalPrice,
        "pending",
        `${address}, ${city}`,
        imageUrl,
      ],
    );

    for (const item of cartItems) {
      await t.none(
        "INSERT INTO order_items(order_id, product_id, quantity, price) VALUES($1,$2,$3,$4)",
        [order.id, item.product_id, item.quantity, item.price],
      );

      await t.none("UPDATE products SET stock = stock - $1 WHERE id = $2", [
        item.quantity,
        item.product_id,
      ]);

      await removeCached(KEYS.prodById(item.product_id));
    }

    await t.none("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
    await t.none("DELETE FROM carts WHERE id = $1", [cartId]);

    await Promise.all([
      removeCached(KEYS.product),
      removeCached(KEYS.cartById(userId)),
      removeCached(KEYS.order),
      removeCached(KEYS.orderById(userId)),
    ]);
  });
};

const updateOrder = async (data: UpdateOrderDTO): Promise<Order> => {
  const { orderId, status } = data;

  const order = await dbEcommerce.one(
    "UPDATE orders set status=$1 WHERE id=$2 RETURNING *",
    [status, orderId],
  );

  await removeCached(KEYS.order);
  await removeCached(KEYS.orderById(order.user_id));

  return order;
};

export default {
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  createOrder,
  updateOrder,
};
