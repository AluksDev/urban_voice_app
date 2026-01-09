const express = require("express");
const router = express.Router();
const { allReports } = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/reports", authMiddleware, allReports);

module.exports = router;