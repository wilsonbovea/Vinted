const mongoose = require("mongoose");
const User = require("../models/user");
const isAuthenticated = async (req, res, next) => {
  const receivedToken = req.headers.authorization.replace("Bearer ", "");
  const userFound = await User.findOne({ token: receivedToken });
  if (!userFound) {
    return res.status(401).json("Unauthorized");
  } else {
    req.user = userFound;
    return next();
  }
};
module.exports = isAuthenticated;
