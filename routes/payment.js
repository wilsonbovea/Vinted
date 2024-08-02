const express = require("express");
const router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.KEY_STRIPE);

router.post("/payment", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,

      currency: "eur",

      description: req.body.title,
    });

    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
