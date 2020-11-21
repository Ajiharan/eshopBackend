import AdminSchema from "./AdminSchema.js";
import express from "express";
import bcryptJs from "bcryptjs";
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

const db = mongoose.connection;
db.once("open", () => {
  console.log("Db is Connected using pusher");
  const msgCollection = db.collection("adminschemas");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A change Occured", change);

    if (change.operationType === "update") {
      const updateDetails = change.updateDescription;
      pusher.trigger("adminDatas", "updated", {
        token: updateDetails.updatedFields.token,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

router.post("/login", async (req, res) => {
  try {
    const validData = await AdminSchema.findOne({ emailId: req.body.emailId });
    if (!validData) {
      return res.status(400).json("Invalid emailId");
    } else {
      const validPass = await bcryptJs.compare(
        req.body.password,
        validData.password
      );
      if (validPass) {
        const adminToken = await jwt.sign(
          {
            _id: validData._id,
            emailId: validData.emailId,
          },
          process.env.SECREAT_KEY,
          { expiresIn: 60 * 10 }
        );
        const update = await AdminSchema.update(
          { _id: validData._id },
          {
            $set: {
              token: adminToken,
            },
          }
        );

        res.header(process.env.SECREAT_KEY, adminToken).json(adminToken);
        // res.cookie(process.env.SECREAT_KEY, adminToken).json(adminToken);
      } else {
        return res.status(400).json("Invalid password");
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get(
  "/details",
  async (req, res, next) => {
    try {
      var jwtToken = req.header(process.env.SECREAT_KEY);
      req.token = token;
      const valid = await TokenValidator(jwtToken);
      if (valid) {
        next();
      } else {
        const update = await setToken(jwt, jwtToken);
        res.status(403).json("Unauthrozied access");
      }
    } catch (err) {
      res.status(400).json(err.message);
    }
  },
  (req, res) => {
    res.status(200).json(req.cookies.Angular);
  }
);

export default router;
