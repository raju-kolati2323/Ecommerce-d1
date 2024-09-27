const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const otpGenerator = require("otp-generator");
const { sendOtpToMobile } = require("../../helpers/otp");
const nodemailer = require("nodemailer");
require('dotenv').config();

let otpStore = {}; 

// Request OTP
const requestOTP = async (req, res) => {
  const { mobileNumber } = req.body;
  const user = await User.findOne({ mobileNumber });

  if (!user) {
    return res.json({
      success: false,
      message: "User not found with this mobile number",
    });
  }

  const otp = otpGenerator.generate(6, { digits: true });
  otpStore[mobileNumber] = otp;
  sendOtpToMobile(mobileNumber, otp);

  res.json({
    success: true,
    message: "OTP sent to your mobile number",
  });
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { mobileNumber, otp } = req.body;
  const user = await User.findOne({ mobileNumber });

  if (!user) {
    return res.json({
      success: false,
      message: "User not found",
    });
  }

  if (otpStore[mobileNumber] === otp) {
    delete otpStore[mobileNumber];

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "OTP verified and logged in successfully",
      user: {
        email: user.email,
        role: user.role,
        id: user._id,
        userName: user.userName,
      },
    });
  } else {
    res.json({
      success: false,
      message: "Invalid OTP",
    });
  }
};

//register
const registerUser = async (req, res) => {
  const { userName, email, password, mobileNumber,role } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists with the same email! Please try again",
      });
    }

    const checkMobile = await User.findOne({ mobileNumber });
    if (checkMobile) {
      return res.json({
        success: false,
        message: "User already exists with the same mobile number! Please try again",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      mobileNumber,
      role,
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};
// Delete User
const deleteUser = async (req, res) => {
  const { userId } = req.body; // Assuming you are sending the user ID in the request body

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// Get Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      success: true,
      users,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service
  host:'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// Request OTP for password reset
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email});

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No user found with this email",
    });
  }

  // Generate OTP
  const otp = otpGenerator.generate(6, { digits: true });
  otpStore[email] = otp;

  const mailOptions = {
    to: email,
    subject: 'Password Reset OTP',
    text: `Your password reset OTP is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Error sending OTP",
      });
    }
    else{
    console.log("OTP sent successfully:", info.response);
    res.status(200).json({
      success: true,
      message: "OTP sent to your email address",
    });
  }
  });
};

// Verify OTP and reset password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (otpStore[email] !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashPassword;
    await user.save();

    delete otpStore[email];

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

module.exports = { requestPasswordReset,resetPassword,requestOTP, verifyOTP, registerUser, loginUser, logoutUser, authMiddleware, getUsers, deleteUser };
