const express = require("express");
const router = express.Router();
const { getReportStats, getLatestReports } = require("../controllers/statsController");

router.get("/reports", getReportStats);
router.get("/reports/latest", getLatestReports);

module.exports = router;
