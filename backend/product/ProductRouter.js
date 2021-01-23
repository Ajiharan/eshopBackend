import ProductSchema from "./ProductSchema.js";
import express from "express";
import jwt from "jsonwebtoken";
import { TokenValidator, setToken } from "../Extras.js";
import Pusher from "pusher";
import mongoose from "mongoose";
const router = express.Router();

const pusher = new Pusher({
  appId: "1107394",
  key: "b58f0426c6ed81540688",
  secret: "89ba9c60b81fd05e2033",
  cluster: "ap2",
  useTLS: true,
});

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
