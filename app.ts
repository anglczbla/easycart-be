import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { dbEcommerce } from "./config/db.ts";
import authRoutes from "./routes/auth.ts";
dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/ecommerce", authRoutes);

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
