const express = require("express");
const {
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} = require("../../controllers/admin/products-controller");

const router = express.Router();

// Remove the image upload route
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get/:adminId", fetchAllProducts);

module.exports = router;
