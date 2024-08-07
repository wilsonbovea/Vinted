const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();
const User = require("../models/user");
// //////////////////////////// SIGN UP /////////////////////////////////
router.post("/user/signup", async (req, res) => {
  try {
    // le premier if il faut au'il soit en rapport aux params body, s'ils sont trusy on peut continuer
    if (req.body.username && req.body.email && req.body.password) {
      if (await User.findOne({ email: req.body.email })) {
        return res.status(400).json({ message: "email is already registered" });
      } else {
        const salt = uid2(16);
        const token = uid2(32);
        const saltedPassword = req.body.password + salt;
        const hash = SHA256(saltedPassword);
        const readableHash = hash.toString(encBase64);
        const newUser = new User({
          email: req.body.email,
          token: token,
          hash: readableHash,
          salt: salt,
          account: {
            username: req.body.username,
            // avatar: Object, // nous verrons plus tard comment uploader une image
          },
          newsletter: req.body.newsletter,
        });
        if (req.files?.avatar) {
          const result = await cloudinary.uploader.upload(
            convertToBase64(req.files.avatar),
            {
              folder: `api/vinted/users/${newUser._id}`,
              public_id: "avatar",
            }
          );
          newUser.account.avatar = result;
        }

        await newUser.save();

        // const newObjUser = {};
        // newObjUser._id = newUser._id;
        // newObjUser.token = newUser.token;
        // newObjUser.account = newUser.account;
        // res.status(201).json(newObjUser);
        res.status(201).json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      }
    } else {
      res.status(500).json({ message: "Missing parameters" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});
// ///////////////////////////////////////// LOGIN  ///////////////////////////////////
router.post("/user/login", async (req, res) => {
  try {
    const userDoc = await User.findOne({ email: req.body.email });
    const hashConfirmation = SHA256(req.body.password + userDoc.salt).toString(
      encBase64
    );
    if (userDoc) {
      if (hashConfirmation === userDoc.hash) {
        // const newObjUser = {};
        // newObjUser._id = userDoc._id;
        // newObjUser.token = userDoc.token;
        // newObjUser.account = userDoc.account;

        // res.status(200).json(newObjUser);
        res.status(200).json({
          _id: userDoc._id,
          token: userDoc.token,
          account: userDoc.account,
        });
      } else {
        res.status(401).json("Email or Password was not correct");
      }
    } else {
      res.status(401).json("Email or Password was not correct");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
