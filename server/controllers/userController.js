const bcrypt = require('bcryptjs');
const validator = require('validator');

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