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
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      if (title && price && req.files?.picture) {
        const newOffer = new Offer({
          product_name: title,
          product_description: description,
          product_price: price,
          product_details: [
            { MARQUE: brand },
            { TAILLE: size },
            { ÉTAT: condition },
            { COULEUR: color },
            { EMPLACEMENT: city },
          ],
          owner: req.user,
        });

        if (!Array.isArray(req.files.picture)) {
          if (req.files.picture.mimetype.slice(0, 5) !== "image") {
            return res.status(400).json({ message: "You must send images" });
          }
          const result = await cloudinary.uploader.upload(
            convertToBase64(req.files.picture),
            {
              folder: `api/vinted/offers/${newOffer._id}`,

              public_id: "preview",
            }
          );

          newOffer.product_image = result;

          newOffer.product_pictures.push(result);
        } else {
          for (let i = 0; i < req.files.picture.length; i++) {
            const picture = req.files.picture[i];

            if (picture.mimetype.slice(0, 5) !== "image") {
              return res.status(400).json({ message: "You must send images" });
            }
            if (i === 0) {
              const result = await cloudinary.uploader.upload(
                convertToBase64(picture),
                {
                  folder: `api/vinted/offers/${newOffer._id}`,
                  public_id: "preview",
                }
              );

              newOffer.product_image = result;
              newOffer.product_pictures.push(result);
            } else {
              const result = await cloudinary.uploader.upload(
                convertToBase64(picture),
                {
                  folder: `api/vinted/offers/${newOffer._id}`,
                }
              );
              newOffer.product_pictures.push(result);
            }
          }
        }
        // newOffer.owner = { account: req.user.account };
        await newOffer.save();
        res.status(200).json(newOffer);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
// ///////////////////////////// FILTERS //////////////////////////////////////
router.get("/offers/", async (req, res) => {
  try {
    const filters = {};
    const limit = 20;
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
        .populate({
          path: "owner",
          select: "account",
        })
        .sort({ product_price: sort })
        .limit(limit)
        .skip(skip);
      const count = await Offer.countDocuments(filters);

      res.status(200).json({
        count: count,
        offers: offers,
      });
    } else if (req.query.sort) {
      const sort = req.query.sort.replace("price-", "");
      const offers = await Offer.find(filters)
        .populate({
          path: "owner",
          select: "account",
        })
        .sort({ product_price: sort })
        .limit(limit)
        .skip(skip);
      const count = await Offer.countDocuments(filters);

      res.status(200).json({
        count: count,
        offers: offers,
      });
    } else {
      const offers = await Offer.find(filters)
        .populate({
          path: "owner",
          select: "account",
        })
        .limit(limit)
        .skip(skip);

      const count = await Offer.countDocuments(filters);

      res.json({
        count: count,
        offers: offers,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// ///////////////////////////// OFFERS ID //////////////////////////////////////
router.get("/offer/:id", async (req, res) => {
  try {
    const offerById = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username account.phone account.avatar",
    });
    res.status(200).json(offerById);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
