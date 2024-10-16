const express = require("express");
const {authMiddleware} = require ('../../controllers/auth/auth-controller')
const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  updateTrackingStatus,
} = require("../../controllers/admin/order-controller");

const router = express.Router();

router.get("/get", authMiddleware, getAllOrdersOfAllUsers);
router.get("/details/:id", authMiddleware, getOrderDetailsForAdmin);
router.put("/update/:id", authMiddleware, updateOrderStatus);
router.put('/updateTracking/:id', authMiddleware, updateTrackingStatus);

module.exports = router;
