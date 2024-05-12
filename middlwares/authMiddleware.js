const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Admin = require("../models/Admins");
const jwtKey = "crud";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //Get token from  header
      token = req.headers.authorization.split(" ")[1];
      //varify Token
      const decoded = jwt.verify(token, jwtKey);

      //Get Admin from token
      req.admin = await Admin.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("not authorized");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not autherized, no token");
  }
});

module.exports = { protect };
