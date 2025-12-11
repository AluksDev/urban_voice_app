const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getLocations, getReportLocation } = require("../controllers/locationsController");

router.get("/", authMiddleware, getLocations);
router.get("/:locationId", authMiddleware, getReportLocation);

module.exports = router;