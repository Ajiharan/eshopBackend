import jwt from "jsonwebtoken";
import AdminSchema from "./admin/AdminSchema.js";
export const TokenValidator = (token) => {
  try {
    const data = jwt.verify(token, process.env.SECREAT_KEY);
    return data ? true : false;
  } catch (err) {
    return false;
  }
};

const setToken = (jwt, jwtToken) => {
  return AdminSchema.updateOne(
    { _id: jwt.decode(jwtToken)._id },
    {
      $set: {
        token: null,
      },
    }
  );
};

export { setToken };
