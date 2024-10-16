const express = require("express");
const {authMiddleware} = require ('../../controllers/auth/auth-controller')
const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", authMiddleware, createOrder);
router.post("/capture/:orderId", capturePayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

module.exports = router;




