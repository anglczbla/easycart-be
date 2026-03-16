import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { dbEcommerce } from "./config/db.ts";
import { redisClient } from "./config/redis.ts";
import authRoutes from "./routes/auth.ts";
import categoryRoutes from "./routes/category.ts";
import productRoutes from "./routes/product.ts";
dotenv.config();

const app = express();
const port = 3000;

redisClient.connect().then(() => {
  console.log("Redis connected");
});

app.use(cors());
app.use(express.json());
app.use("/api/ecommerce/users", authRoutes);
app.use("/api/ecommerce/products", productRoutes);
app.use("/api/ecommerce/category", categoryRoutes);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);

  dbEcommerce
    .connect()
    .then((obj) => {
      console.log("Database connected successfully");
      obj.done();
    })
    .catch((error) => {
      console.log("Database connection error:", error.message || error);
    });
});
