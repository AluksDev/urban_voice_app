const express = require("express");
const router = express.Router();
const { getAnnouncements } = require("../controllers/announcementsController");

router.get("/", getAnnouncements);

module.exports = router;