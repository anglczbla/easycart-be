import { redisClient } from "../config/redis.ts";

const KEYS = {
  all: "user:all",
  byId: (id: string) => `product:${id}`,
};

const TTL = {
  all: 300,
  byId: 600,
};

async function getCached(key: any) {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

async function setCached(key: any, data: any, ttl: number) {
  await redisClient.set(key, JSON.stringify(data), { EX: ttl });
}

async function invalidateProduct(id: string) {
  await Promise.all([
    redisClient.del(KEYS.byId(id)),
    redisClient.del(KEYS.all),
  ]);
}

async function invalidateAll() {
  await redisClient.del(KEYS.all);
}

export { getCached, invalidateAll, invalidateProduct, KEYS, setCached, TTL };
