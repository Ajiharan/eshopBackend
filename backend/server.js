import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);
const app = express();
app.use(express.json());
dotenv.config();
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json("Thanusa I love u");
});

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
