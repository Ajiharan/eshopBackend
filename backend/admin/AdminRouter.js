import AdminSchema from "./AdminSchema.js";
import express from "express";
import bcryptJs from "bcryptjs";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/login", async (req, res) => {
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
        process.env.SECREAT_KEY
      );

      res.cookie(process.env.SECREAT_KEY, adminToken);
      res.status(200).json(adminToken);
    } else {
      return res.status(400).json("Invalid password");
    }
  }
});

export default router;
