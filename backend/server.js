import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import AdminRouter from "./admin/AdminRouter.js";
import CategoryRouter from "./category/CategoryRouter.js";
import ProductRouter from "./product/ProductRouter.js";
import cookieParser from "cookie-parser";
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);
const app = express();
app.use(express.json());
app.use(cookieParser());
dotenv.config();
app.use(morgan("dev"));
app.use(cors());

app.use("/admin", AdminRouter);
app.use("/admin/category", CategoryRouter);
app.use("/admin/product", ProductRouter);

const PORT = 5000 || process.env.PORT;

mongoose.connect(process.env.DB_CONNECTION, (err) => {
  if (err) {
    throw err;
  }
  console.log("DB connected successfully");
});

app.listen(PORT, () => {
  console.log(`Port listen in ${PORT}`);
});
