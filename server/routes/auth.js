const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const { login, signup, logout, verify } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/verify", authMiddleware, verify);

module.exports = router;