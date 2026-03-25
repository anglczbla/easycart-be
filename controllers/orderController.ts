import type { Request, Response } from "express";
import {
  getCached,
  KEYS,
  removeCached,
  setCached,
  TTL,
} from "../cache/userCache.ts";
import { dbEcommerce } from "../config/db.ts";
import type { Cart } from "./cartController.ts";
interface Order {
  userId: string;
  totalPrice: number;
  shippingAddress: string;
  status: string;
}

const getAllOrders = async (req: Request<{}, {}, Order>, res: Response) => {
  try {
    const cached = await getCached(KEYS.order);

    if (cached) {
      return res.status(200).json({
        message: "success fetch order",
        data: cached,
      });
    }

    const getOrder = await dbEcommerce.query("SELECT * FROM orders");
    await setCached(KEYS.order, getOrder, TTL.order);
    return res.status(200).json({
      message: "success",
      data: getOrder,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const getOrdersByUser = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
) => {
  try {
    const id = req.userId;
    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }
    const cached = await getCached(KEYS.orderById(id));

    if (cached) {
      return res.status(200).json({
        message: "success fecth order",
        status: true,
        data: cached,
      });
    }

    const orders = await dbEcommerce.manyOrNone(
      "SELECT * FROM orders WHERE user_id = $1",
      [id],
    );

    if (!orders) {
      return res.status(404).json({
        message: "order not found",
        status: false,
      });
    }

    await setCached(KEYS.orderById(id), orders, TTL.orderById);

    return res.status(200).json({
      message: "success fetch orders",
      data: orders,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const getOrderById = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
) => {
  const { id } = req.params;

  const order = await dbEcommerce.oneOrNone(
    "SELECT * FROM orders WHERE id = $1",
    [id],
  );

  if (!order) {
    return res.status(404).json({ message: "order not found" });
  }

  const orderItems = await dbEcommerce.manyOrNone(
    "SELECT * FROM order_items WHERE order_id = $1",
    [id],
  );

  return res.status(200).json({
    message: "success fetch order",
    data: { ...order, items: orderItems },
  });
};

const createOrder = async (req: Request<{}, {}, Order>, res: Response) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const findAddress = await dbEcommerce.oneOrNone(
      "SELECT address, city FROM users WHERE id = $1",
      [id],
    );

    if (!findAddress) {
      return res.status(404).json({ message: "address not found" });
    }

    const carts = await dbEcommerce.oneOrNone(
      "SELECT * FROM carts WHERE user_id = $1",
      [id],
    );

    if (!carts) {
      return res.status(404).json({ message: "cart not found" });
    }

    const cartItems = await dbEcommerce.manyOrNone(
      `SELECT 
        cart_items.product_id,
        cart_items.quantity,
        products.price
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.cart_id = $1`,
      [carts.id],
    );

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: "cart is empty" });
    }

    const totalPrice = cartItems.reduce(
      (acc: number, item: Cart) => acc + item.price * item.quantity,
      0,
    );

    await dbEcommerce.tx(async (t) => {
      const order = await t.one(
        "INSERT INTO orders(user_id, total_price, status, shipping_address) VALUES($1, $2, $3, $4) RETURNING id",
        [
          id,
          totalPrice,
          "pending",
          `${findAddress.address}, ${findAddress.city}`,
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

      await t.none("DELETE FROM cart_items WHERE cart_id = $1", [carts.id]);
      await t.none("DELETE FROM carts WHERE id = $1", [carts.id]);

      await Promise.all([
        removeCached(KEYS.product),
        removeCached(KEYS.cartById(id)),
        removeCached(KEYS.order),
        removeCached(KEYS.orderById(id)),
      ]);
    });

    return res.status(201).json({
      message: "success create order",
      success: true,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const updateOrder = async (
  req: Request<{ id: string }, {}, { status: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(404).json({
        message: "orders not found",
        status: false,
      });
    }

    const order = await dbEcommerce.one(
      "UPDATE orders set status=$1 WHERE id=$2 RETURNING *",
      [status, id],
    );

    await removeCached(KEYS.order);
    await removeCached(KEYS.orderById(id));

    return res.status(200).json({
      message: "success update order",
      data: order,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export default {
  getOrdersByUser,
  createOrder,
  getAllOrders,
  updateOrder,
  getOrderById,
};
