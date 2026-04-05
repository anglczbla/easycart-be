import cors from "cors";
import express from "express";
import connectCloudinary from "../config/cloudinary";
import { dbEcommerce } from "../config/db";
import { redisClient } from "../config/redis";
import authRoutes from "../routes/auth";
import cartRoutes from "../routes/cart";
import categoryRoutes from "../routes/category";
import orderRoutes from "../routes/order";
import productRoutes from "../routes/product";
import reviewRoute from "../routes/review";
import userRoute from "../routes/user";

const app = express();
const port = 3000;

redisClient.connect().then(() => {
  console.log("Redis connected");
});

connectCloudinary();
app.use(cors());
app.use(express.json());
app.use("/api/ecommerce/auth", authRoutes);
app.use("/api/ecommerce/users", userRoute);
app.use("/api/ecommerce/products", productRoutes);
app.use("/api/ecommerce/category", categoryRoutes);
app.use("/api/ecommerce/cart", cartRoutes);
app.use("/api/ecommerce/orders", orderRoutes);
app.use("/api/ecommerce/review", reviewRoute);

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
