const bcrypt = require('bcryptjs');
const validator = require('validator');
const fs = require("fs");
const path = require("path");

exports.changePassword = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        })
    }
    const userId = req.user.id;
    if (!req.body.oldPassword || !req.body.newPassword) {
        return res.status(400).json({
            success: false,
            message: "Missing password"
        })
    }
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    if (!validator.isLength(newPassword, { min: 8, max: 100 })) {
        return res.status(400).json({
            success: false,
            message: "Invalid password format"
        })
    }
    const [rows] = await req.db.query("SELECT hashed_psw FROM users WHERE id = ?", [userId]);
    if (rows.length == 0) {
        return res.status(400).json({
            success: false,
            message: "User not found"
        })
    }
    const oldHashedPsw = rows[0].hashed_psw;
    if (await bcrypt.compare(oldPassword, oldHashedPsw)) {
        const newHashedPsw = await bcrypt.hash(newPassword, 10);
        const [user] = await req.db.query("UPDATE users SET hashed_psw = ? WHERE id = ?", [newHashedPsw, userId]);
        if (user.affectedRows === 1) {
            return res.status(200).json({
                success: true,
                message: "Password changed successfully"
            })
        } else {
            return res.status(500).json({
                success: false,
                message: "Unable to update password"
            })
        }
    } else {
        return res.status(401).json({
            success: false,
            message: "Unable to update password"
        })

    }
}

exports.changeDetails = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        })
    }
    const userId = req.user.id;
    const name = req.body.name;
    if (!validator.isLength(name, { min: 1, max: 100 })) {
        return res.status(400).json({
            success: false,
            message: "Invalid name format"
        })
    }
    const surname = req.body.surname;
    if (!validator.isLength(surname, { min: 1, max: 100 })) {
        return res.status(400).json({
            success: false,
            message: "Invalid surname format"
        })
    }
    const [user] = await req.db.query("UPDATE users SET name = ?, surname = ? WHERE id = ?", [name, surname, userId]);
    if (user.affectedRows === 1) {
        return res.status(200).json({
            success: true,
            message: "Details changed successfully"
        })
    } else {
        return res.status(500).json({
            success: false,
            message: "Unable to update details"
        })
    }
}

exports.changeProfilePhoto = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        })
    }
    const userId = req.user.id;
    const newPhotoUrl = req.file ? `/uploads/users/${req.file.filename}` : null;

    const [rows] = await req.db.query("SELECT photo_url FROM users WHERE id = ?", [userId]);
    const currentPhoto = rows[0]?.photo_url;

    if (currentPhoto) {
        if (!currentPhoto.includes("default_user.jpg")) {
            const oldFilePath = path.join(__dirname, "..", currentPhoto);
            fs.unlink(oldFilePath, (err) => {
                if (err) console.error("Failed to delete old profile image:", err);
            });
        }
    }

    const [user] = await req.db.query("UPDATE users SET photo_url = ? WHERE id = ?", [newPhotoUrl, userId]);
    if (user.affectedRows === 1) {
        return res.status(200).json({
            success: true,
            message: "Profile photo changed successfully",
            photo_url: `${req.protocol}://${req.get("host")}${newPhotoUrl}`
        })
    } else {
        return res.status(500).json({
            success: false,
            message: "Unable to update profile photo"
        })
    }
}

exports.fetchNotifications = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        })
    }
    const userId = req.user.id;
    const [notifications] = await req.db.query("SELECT n.* FROM notifications n INNER JOIN notification_user nu ON n.id = nu.notification_id WHERE nu.user_id = ? AND nu.is_read = 0 ORDER BY n.created_at DESC", [userId]);
    if (notifications.length > 0) {
        return res.status(200).json({
            success: true,
            notifications
        })
    } else {
        return res.status(200).json({
            success: true,
            notifications: []
        })
    }
}

exports.readNotification = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        });
    }

    const userId = req.user.id;
    const notificationId = req.params.id;

    try {
        const [rows] = await req.db.query(
            "SELECT is_read FROM notification_user WHERE user_id = ? AND notification_id = ?",
            [userId, notificationId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        if (rows[0].is_read === 0) {
            await req.db.query(
                "UPDATE notification_user SET is_read = 1 WHERE user_id = ? AND notification_id = ?",
                [userId, notificationId]
            );
        }

        return res.json({
            success: true,
            code: "Notification marked as read"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            code: "Unable to mark notification as read"
        });
    }
};
