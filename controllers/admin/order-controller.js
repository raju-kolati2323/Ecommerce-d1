const Order = require("../../models/Order");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Admin not authenticated!",
      });
    }
    
    const orders = await Order.find({adminId: req.user._id});

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
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById({_id: id, adminId: req.user._id});

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
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById({_id: id, adminId: req.user._id});

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateTrackingStatus = async (req, res) => {
  const { id } = req.params;
  const { trackingStatus } = req.body;

  try {
    const order = await Order.findById({_id: id, adminId: req.user._id});
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.trackingStatus = trackingStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Tracking status updated successfully',
      order:order
    });
  } catch (error) {
    console.error('Error updating tracking status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  updateTrackingStatus,
};


