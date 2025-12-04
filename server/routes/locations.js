const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getLocations } = require("../controllers/locationsController");

router.get("/", authMiddleware, getLocations);

module.exports = router;