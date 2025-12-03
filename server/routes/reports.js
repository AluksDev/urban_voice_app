const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { newReport, userReports } = require("../controllers/reportsController")
const multer = require('multer')
const path = require("path");

//This allows adding exension to the file name
const storage = multer.diskStorage({
    destination: "uploads/reports",
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + ext);
    }
});

function fileFilter(req, file, cb) {
    // Allowed MIME types for images
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    if (allowedTypes.includes(file.mimetype)) {
        // Accept the file
        cb(null, true);
    } else {
        // Reject the file
        cb(new Error("Only image files are allowed"), false);
    }
}

const upload = multer({ storage, fileFilter });

router.post("/new", authMiddleware, upload.single('image'), newReport);
router.get("/user", authMiddleware, userReports);

module.exports = router;