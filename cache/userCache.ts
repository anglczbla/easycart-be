import { redisClient } from "../config/redis.ts";

const KEYS = {
  session: (id: string) => `session:user:${id}`,
  product: "products:all",
  prodById: (id: string) => `product:${id}`,
  categories: "categories:all",
  categoryById: (id: string) => `category:${id}`,

  cartById: (id: string) => `carts:${id}`,
};

const TTL = {
  session: 24 * 60 * 60, // 1 day in seconds
  product: 300,
  prodById: 600,
  categories: 300,
  categoryById: 600,
  cartById: 600,
};

async function getCached(key: string) {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

async function setCached(key: string, data: any, ttl: number) {
  await redisClient.set(key, JSON.stringify(data), { EX: ttl });
}

async function removeCached(key: string) {
  await redisClient.del(key);
}

export { getCached, KEYS, removeCached, setCached, TTL };
