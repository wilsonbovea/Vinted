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
    res.status(200).json("Welcome to Vinted Back-end");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// //////////////////////////// USER /////////////////////////////////
const routeUser = require("./routes/user");
app.use(routeUser);
// //////////////////////////// OFFERS /////////////////////////////////
const routeOffers = require("./routes/offers");
app.use(routeOffers);
// //////////////////////////// PAYEMENT /////////////////////////////////
const routePayment = require("./routes/payment");
app.use(routePayment);
// //////////////////////////// /////////////////////////////////
app.all("*", (req, res) => {
  res.status(404).json({ message: "Route non found" });
});
app.listen(process.env.PORT || 3000, () => {
  console.log("SERVER STARTED 🚀");
});
