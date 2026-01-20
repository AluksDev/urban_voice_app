const express = require("express");
const router = express.Router();
const { allReports, allUsers, updateStatus, allAnnouncements, newAnnouncement, changeAnnouncementStatus } = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/reports", authMiddleware, allReports);
router.get("/users", authMiddleware, allUsers);
router.patch("/reports/:id", authMiddleware, updateStatus);
router.get("/announcements", authMiddleware, allAnnouncements);
router.post("/announcements", authMiddleware, newAnnouncement);
router.patch("/announcements/:id/:action", authMiddleware, changeAnnouncementStatus);

module.exports = router;