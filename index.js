require("dotenv").config();
const cors = require("cors");
const express = require("express");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);
// //////////////////////////// CONFIG CLOUDINARY /////////////////////////////////
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.get("/", (req, res) => {
  try {
    res.status(200).json("Welcome to Sign-Up");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// //////////////////////////// USER /////////////////////////////////
const routeUser = require("./routes/user");
app.use(routeUser);
// //////////////////////////// PUBLISH /////////////////////////////////
const routePublish = require("./routes/publish");
app.use(routePublish);

// //////////////////////////// /////////////////////////////////
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route non found" });
});
app.listen(process.env.PORT, () => {
  console.log("SERVER STARTED 🚀");
});
