import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_CLIENT,
}).on("error", (err) => console.log("Redis error: ", err));
