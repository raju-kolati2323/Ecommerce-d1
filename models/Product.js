const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    images: String,
    title: String,
    description: String,
    category: {
      type: String,
      required: true,
    },
    categoryImage: {
      type: String, // Optional
    },
    brand: {
      type: String,
      required: true,
    },
    brandImage: {
      type: String, // Optional
    },
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    adminId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
