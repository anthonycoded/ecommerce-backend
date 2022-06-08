const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    quantity: {
      type: String,
    },
    colors: {
      type: Object,
    },

    likes: {
      type: Number,
    },
    created: {
      type: Number,
      required: true,
    },

    tags: {
      type: String,
    },
    featured: {
      type: Boolean,
    },
  },
  {
    collection: "products",
  }
);
module.exports = mongoose.model("Product", productSchema);
