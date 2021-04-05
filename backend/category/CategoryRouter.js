import CategorySchema from "./CategorySchema.js";
import express from "express";
import jwt from "jsonwebtoken";
import { TokenValidator, setToken } from "../Extras.js";
import Pusher from "pusher";
import mongoose from "mongoose";
import client from "../RedisConfig.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
let keyValue = uuidv4();
const pusher = new Pusher({
  appId: "1107394",
  key: "b58f0426c6ed81540688",
  secret: "89ba9c60b81fd05e2033",
  cluster: "ap2",
  useTLS: true,
});
client.on("error", function (error) {
  console.error(error);
});
const db = mongoose.connection;
db.once("open", () => {
  const msgCollection = db.collection("categoryschemas");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    // console.log("A change Occured", change);

    if (change.operationType === "insert") {
      const updateDetails = change.fullDocument;
      pusher.trigger("categoryData", "inserted", {
        categoryData: updateDetails,
      });
    } else if (change.operationType === "delete") {
      pusher.trigger("categoryDataDeleted", "deleted", {
        dataDeleted: true,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

router.get(
  "/view",
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
      //   console.log(err);
      res.status(400).json(err.message);
    }
  },
  async (req, res) => {
    client.get(keyValue, (err, response) => {
      if (response) {
        if (JSON.parse(response).length > 0) {
          res.status(200).json(JSON.parse(response));
        } else {
          res.status(204).json("No data");
        }
      } else {
        CategorySchema.find()
          .then((result) => {
            if (result.length > 0) {
              client.set(keyValue, JSON.stringify(result));
              res.status(200).json(result);
            } else {
              res.status(204).json("No data");
            }
          })
          .catch((err) => {
            res.status(400).json(err.message);
          });
      }
    });
  }
);

router.delete(
  "/delete/:id",
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
      //   console.log(err);
      res.status(400).json(err.message);
    }
  },
  async (req, res) => {
    CategorySchema.deleteOne({ _id: req.params.id })
      .then((result) => {
        client.del(keyValue, (err, response) => {
          keyValue = uuidv4();
        });
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(400).json(err.message);
      });
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
    const isExists = await CategorySchema.find(
      { name: req.body.name.toLowerCase() },
      { _id: 0, description: 0 }
    );
    if (isExists.length > 0) {
      res.status(400).json("Sorry Name already exists");
    } else {
      client.del(keyValue, (err, response) => {
        keyValue = uuidv4();
      });
      const categoryData = await new CategorySchema({
        name: req.body.name.toLowerCase(),
        description: req.body.description,
      });
      const saveData = await categoryData.save();
      res.status(200).json(saveData);
    }
  }
);

export default router;
