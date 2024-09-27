const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  deleteUser,
  getUsers,
  requestOTP,
  verifyOTP,
  requestPasswordReset,
  resetPassword,
} = require("../../controllers/auth/auth-controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/delete", deleteUser);
router.get("/users", getUsers);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});
router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);


module.exports = router;
