const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const { changePassword, changeDetails } = require("../controllers/userController");

router.patch("/password", authMiddleware, changePassword);
router.patch("/details", authMiddleware, changeDetails);

module.exports = router;