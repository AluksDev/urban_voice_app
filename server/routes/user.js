const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require('multer')
const path = require("path");

const { changePassword, changeDetails, changeProfilePhoto, fetchNotifications } = require("../controllers/userController");

//This allows adding exension to the file name
const storage = multer.diskStorage({
    destination: "uploads/users",
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + ext);
    }
});

function fileFilter(req, file, cb) {
    // Allowed MIME types for images
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        // Accept the file
        cb(null, true);
    } else {
        // Reject the file
        cb(new Error("Only image files are allowed"), false);
    }
}

const upload = multer({ storage, fileFilter });

router.patch("/password", authMiddleware, changePassword);
router.patch("/details", authMiddleware, changeDetails);
router.patch("/photo", authMiddleware, upload.single('photo'), changeProfilePhoto);
router.get("/notifications", authMiddleware, fetchNotifications);

module.exports = router;