const { param } = require("../routes/admin");

exports.allReports = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const [reports] = await req.db.query("SELECT * from reports");
    if (!reports) {
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    }
    return res.status(200).json({ success: true, reports });
}

exports.allUsers = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const [users] = await req.db.query("SELECT id, name, surname, email, role, photo_url, created_at, updated_at, status FROM users");
    if (!users) {
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    }
    for (let user of users) {
        user.photo_url = user.photo_url ? `${req.protocol}://${req.get("host")}${user.photo_url}` : null;
    }
    return res.status(200).json({ success: true, users });
}

exports.updateStatus = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const reportId = req.params.id;
    const { status } = req.body;
    const [result] = await req.db.query("UPDATE reports SET status = ? WHERE id = ?", [status, reportId]);
    if (result.affectedRows === 1) {
        const [report] = await req.db.query("SELECT * FROM reports WHERE id = ?", [reportId]);
        return res.status(200).json({ success: true, code: "STATUS_UPDATED", report: report[0] });
    } else {
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    }
}

exports.allAnnouncements = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const [announcements] = await req.db.query("SELECT * from announcements");
    if (!announcements) {
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    }
    return res.status(200).json({ success: true, announcements });
}

exports.newAnnouncement = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const { title, content, publish } = req.body;
    const userId = req.user.id;
    const [result] = await req.db.query("INSERT INTO announcements (title, content, is_published, created_by, updated_at) VALUES (?, ?, ?, ?, NOW())", [title, content, publish, userId]);
    if (result.affectedRows === 1) {
        return res.status(200).json({ success: true, code: "ANNOUNCEMENT_CREATED" });
    } else {
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    }
}

exports.changeAnnouncementStatus = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const announcementId = req.params.id;
    if (req.params.action === 'publish') {
        const [result] = await req.db.query("UPDATE announcements SET is_published = 1, updated_at = NOW() WHERE id = ?", [announcementId]);
        if (result.affectedRows === 1) {
            return res.status(200).json({ success: true, code: "ANNOUNCEMENT_PUBLISHED" });
        } else {
            return res.status(500).json({ success: false, code: "DB_ERROR" });
        }
    } else if (req.params.action === 'unpublish') {
        const [result] = await req.db.query("UPDATE announcements SET is_published = 0, updated_at = NOW() WHERE id = ?", [announcementId]);
        if (result.affectedRows === 1) {
            return res.status(200).json({ success: true, code: "ANNOUNCEMENT_UNPUBLISHED" });
        } else {
            return res.status(500).json({ success: false, code: "DB_ERROR" });
        }
    } else if (req.params.action === 'archive') {
        const [result] = await req.db.query("UPDATE announcements SET archived_at = NOW(), updated_at = NOW() WHERE id = ?", [announcementId]);
        if (result.affectedRows === 1) {
            return res.status(200).json({ success: true, code: "ANNOUNCEMENT_ARCHIVED" });
        } else {
            return res.status(500).json({ success: false, code: "DB_ERROR" });
        }
    } else if (req.params.action === 'restore') {
        const [result] = await req.db.query("UPDATE announcements SET archived_at = NULL, updated_at = NOW(), is_published = 0 WHERE id = ?", [announcementId]);
        if (result.affectedRows === 1) {
            return res.status(200).json({ success: true, code: "ANNOUNCEMENT_RESTORED" });
        } else {
            return res.status(500).json({ success: false, code: "DB_ERROR" });
        }
    };
}

exports.updateUserStatus = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const userId = req.params.id;
    const { status } = req.body;
    const [result] = await req.db.query("UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?", [status, userId]);
    if (result.affectedRows === 1) {
        return res.status(200).json({ success: true, code: "USER_STATUS_UPDATED" });
    } else {
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    }
}
exports.getUserReports = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const userId = req.params.id;
    const [reports] = await req.db.query("SELECT * FROM reports WHERE user_id = ?", [userId]);
    if (!reports) {
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    }
    return res.status(200).json({ success: true, reports });
}  