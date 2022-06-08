const mongoose = require("mongoose");
const express = require("express");
const Multer = require("multer");
const router = express.Router();
const { format } = require("util");
const mime = require("mime-types");
const { v4: uuidv4 } = require("uuid");

const { Storage } = require("@google-cloud/storage"); // Imports the Google Cloud client library
const storage = new Storage(); // Creates a client
const bucket = storage.bucket("jaysworld-images"); //Image Bucket

let productSchema = require("../models/product");

//Multer Configurations
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "product") {
    if (
      file.mimetype === "audio/mp3" ||
      file.mimetype === "audio/mpga" ||
      file.mimetype === "audio/wav"
    ) {
      // check file type to be pdf, doc, or docx
      cb(null, true);
    } else {
      cb(null, false); // else fails
    }
  } else {
    if (
      file.mimetype == "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg, and.jpeg format allowed!"));
    }
  }
};

//Multer upload image
const upload = Multer({
  fileFilter: fileFilter,
  storage: Multer.memoryStorage(),
});

//Upload image, Create new track
router.post(
  "/upload-product",
  upload.single("image"),
  async (req, res, next) => {
    const type = mime.lookup(req.file.originalname);
    const uniqueName = uuidv4();

    try {
      // Create a new blob in the bucket and upload the file data.
      const blob = bucket.file(`${uniqueName}`);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: type,
        public: true,
      });
      blobStream.on("error", (err) => {
        next(err);
      });

      blobStream.on("finish", async () => {
        const savedName = `https://storage.googleapis.com/jaysworld-images/${blob.name}`;
        const product = new productSchema({
          title: req.body.title,
          description: req.body.description,
          purchasePrice: req.body.purchasePrice,
          leasePrice: req.body.leasePrice,
          image: savedName,
          url: req.body.url,
          plays: 0,
          likes: 0,
          downloads: 0,
          created: new Date(),
          credits: req.body.credits,
          //tags: req.body.tags,
        });
        let savedproduct = await product.save();

        res.status(201).json({
          success: true,
          message: "successfully saved",
          newproduct: savedproduct,
        });
      });

      blobStream.end(req.file.buffer);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error,
      });
    }
  }
);

//Get Wishlist
router.route("/get-all").get((req, res) => {
  productSchema.find((error, data) => {
    if (error) {
      return error;
    } else {
      res.json(data);
    }
  });
});

//Get product including data
router.route("/get-product").get((req, res) => {
  productSchema.find((error, data) => {
    if (error) {
      return error;
    } else {
      res.json(data);
    }
  });
});

//Get product by id
router.route("/get-product/:id").get((req, res) => {
  productSchema.findById(req.params.id, (error, data) => {
    if (error) {
      return error;
    } else {
      res.json(data);
    }
  });
});

//Delete product by id
router.route("/delete-product").post(async (req, res) => {
  let id = req.body.productId;
  productSchema.findByIdAndDelete(id, (error) => {
    if (error) {
      return error;
    } else {
      res.status(200).json({
        success: true,
        message: "product succesfully deleted",
      });
    }
  });
});
module.exports = router;
