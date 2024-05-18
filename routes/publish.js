const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");
const router = express.Router();
const Offer = require("../models/offer");
const User = require("../models/user");
// ///////////////////////////// //////////////////////////////////////
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};
// ///////////////////////////// PUBLISH //////////////////////////////////////
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const pictureToUpload = req.files.picture;

      const result = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload)
      );

      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ETAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        product_image: result,
        owner: req.user,
      });
      newOffer.owner = { account: req.user.account };
      await newOffer.save();
      res.status(200).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
// ///////////////////////////// FILTERS //////////////////////////////////////
router.get("/offers/", async (req, res) => {
  try {
    const filters = {};
    const limit = 2;
    const skip = (req.query.page - 1) * limit;

    if (req.query.title) {
      const regex = new RegExp(req.query.title, "i");
      filters.product_name = regex;
    }
    if (req.query.priceMin && req.query.priceMax) {
      filters.product_price = {
        $gte: req.query.priceMin,
        $lte: req.query.priceMax,
      };
    } else if (req.query.priceMin) {
      filters.product_price = {
        $gte: req.query.priceMin,
      };
    } else if (req.query.priceMax) {
      filters.product_price = {
        $lte: req.query.priceMax,
      };
    }
    if (req.query.sort && req.query.page) {
      const sort = req.query.sort.replace("price-", "");
      const offers = await Offer.find(filters)
        .sort({ product_price: sort })
        .limit(limit)
        .skip(skip);

      return res.status(200).json(offers);
    } else if (req.query.sort) {
      const sort = req.query.sort.replace("price-", "");
      const offers = await Offer.find(filters)
        .sort({ product_price: sort })
        .limit(limit)
        .skip(skip);

      return res.status(200).json(offers);
    } else {
      const offers = await Offer.find(filters).limit(limit).skip(skip);

      return res.status(200).json(offers);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// ///////////////////////////// OFFERS ID //////////////////////////////////////
router.get("/offers/:id", async (req, res) => {
  try {
    const offerById = await Offer.findById(req.params.id).populate("owner");
    res.status(200).json(offerById);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
// https://upload-request.cloudinary.com/dxrlvaybw/64133149b667e82144b980b14c7d5521
