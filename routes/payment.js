const express = require("express");
const router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.KEY_STRIPE);

router.post("/payment", async (req, res) => {
  try {
    const amount = req.body.amount * 100;
    const amountFixed = amount.toFixed(0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountFixed,

      currency: "eur",

      description: req.body.title,
    });

    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
