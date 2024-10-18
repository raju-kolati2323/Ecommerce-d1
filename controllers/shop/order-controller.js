const Razorpay = require('razorpay');
const Order = require("../../models/Order");
// const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const crypto=require('crypto');
require('dotenv').config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    if (!userId || !cartItems || !addressInfo || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing!",
      });
    }

    if (paymentMethod !== 'razorpay') {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const adminIds = new Set(); // Use a Set to collect unique admin IDs

    // Gather unique adminIds from the cartItems
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        adminIds.add(product.adminId);
      } else {
        return res.status(400).json({
          success: false,
          message: "Product not found!",
        });
      }
    }

    const options = {
      amount: totalAmount * 100,
      currency: "USD",
      receipt: `order_${Date.now()}`,
    };

    razorpayInstance.orders.create(options, async (error, order) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Error while creating Razorpay order",
        });
      }

      const newlyCreatedOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus: "pending",
        paymentMethod,
        paymentStatus: "pending",
        totalAmount,
        orderDate: new Date(),
        orderUpdateDate,
        paymentId: "",
        payerId: "",
        adminId: Array.from(adminIds) // Store unique adminIds
      });

      await newlyCreatedOrder.save();

      res.status(201).json({
        success: true,
        approvalURL: order.short_url,
        razorpayOrderId: order.id,
        orderId: newlyCreatedOrder._id,
      });
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};



const capturePayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const {orderId} = req.params;
  console.log("orderid",orderId);

  // Generate the signature expected from Razorpay
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET) //Razorpay secret key
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature === razorpay_signature) {
    try {
      // Update the order with payment details
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'success',
        orderStatus: 'success',
        paymentId: razorpay_payment_id,
        orderUpdateDate: new Date(),
      });
      res.status(200).json({
        message:"payment sucessful",
        success:true
      });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ success: false, message: "Database update failed" });
    }
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).lean();
    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
}

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
