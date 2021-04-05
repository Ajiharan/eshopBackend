import ProductSchema from "./ProductSchema.js";
import express from "express";
import jwt from "jsonwebtoken";
import { TokenValidator, setToken } from "../Extras.js";
import Pusher from "pusher";
import mongoose from "mongoose";
const router = express.Router();
const db = mongoose.connection;
const pusher = new Pusher({
  appId: "1107394",
  key: "b58f0426c6ed81540688",
  secret: "89ba9c60b81fd05e2033",
  cluster: "ap2",
  useTLS: true,
});

db.once("open", () => {
  const msgCollection = db.collection("productschemas");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    // console.log("A change Occured", change);

    if (change.operationType === "insert") {
      const updateDetails = change.fullDocument;
      pusher.trigger("productData", "inserted", {
        productData: updateDetails,
      });
    } else if (change.operationType === "delete") {
      pusher.trigger("productData", "deleted", {
        dataDeleted: true,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

router.delete(
  "/delete",
  async (req, res, next) => {
    try {
      var jwtToken = req.header(process.env.SECREAT_KEY);

      req.token = jwtToken;
      const valid = await TokenValidator(jwtToken);
      if (valid) {
        next();
      } else {
        const update = await setToken(jwt, jwtToken);
        res.status(403).json("Sorry your Token is expired!");
      }
    } catch (err) {
      res.status(400).json(err.message);
    }
  },
  async (req, res) => {
    const pid = req.query.id;
    // console.log("pid", pid);
    ProductSchema.findByIdAndDelete(pid)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(400).json(err.message);
      });
    // res.status(200).json(pid);
  }
);

router.post(
  "/add",
  async (req, res, next) => {
    try {
      var jwtToken = req.header(process.env.SECREAT_KEY);
      // console.log("jwtToken", jwtToken);
      req.token = jwtToken;
      const valid = await TokenValidator(jwtToken);
      if (valid) {
        next();
      } else {
        const update = await setToken(jwt, jwtToken);
        res.status(403).json("Sorry your Token is expired!");
      }
    } catch (err) {
      //   console.log(err);
      res.status(400).json(err.message);
    }
  },
  async (req, res) => {
    const isExists = await ProductSchema.find(
      { productName: req.body.productName.toLowerCase() },
      { _id: 0, description: 0 }
    );
    if (isExists.length > 0) {
      res.status(400).json("Sorry Name already exists");
    } else {
      const productData = await new ProductSchema({
        categoryName: req.body.categoryName.toLowerCase(),
        productName: req.body.productName.toLowerCase(),
        productCount: req.body.count,
        productPrice: req.body.price,
        ImageUrl: req.body.ImageUrl,
      });
      const saveData = await productData.save();
      res.status(200).json(saveData);
    }
  }
);

router.get(
  "/view",
  async (req, res, next) => {
    try {
      var jwtToken = req.header(process.env.SECREAT_KEY);
      // console.log("jwtToken", jwtToken);
      req.token = jwtToken;
      const valid = await TokenValidator(jwtToken);
      if (valid) {
        next();
      } else {
        await setToken(jwt, jwtToken);
        res.status(403).json("Sorry your Token is expired!");
      }
    } catch (err) {
      //   console.log(err);
      res.status(400).json(err.message);
    }
  },
  async (req, res) => {
    const products = await ProductSchema.find();
    if (products.length === 0) {
      res.status(400).json("Sorry we don't have any data");
    } else {
      res.status(200).json(products);
    }
  }
);

export default router;
