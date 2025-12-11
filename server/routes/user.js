const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const { changePassword } = require("../controllers/userController");

router.patch("/password", authMiddleware, changePassword);

module.exports = router;