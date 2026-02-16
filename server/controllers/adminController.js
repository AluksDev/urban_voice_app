const { param } = require("../routes/admin");

exports.allReports = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }
    const [reports] = await req.db.query("SELECT r.*, COUNT(ru.report_id) as likes from reports r LEFT JOIN report_upvotes ru ON r.id = ru.report_id GROUP BY r.id");
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
    const connection = await req.db.getConnection();
    try {
        await connection.beginTransaction();

        // 1️⃣ Update report status
        const [updateResult] = await connection.query(
            "UPDATE reports SET status = ? WHERE id = ?",
            [status, reportId]
        );

        if (updateResult.affectedRows !== 1) {
            await connection.rollback();
            return res.status(400).json({ success: false, code: "REPORT_NOT_FOUND" });
        }

        // 2️⃣ Get report to find the owner
        const [reportRows] = await connection.query(
            "SELECT * FROM reports WHERE id = ?",
            [reportId]
        );

        const report = reportRows[0];
        const userId = report.user_id;

        // 3️⃣ Create notification
        const [notification] = await connection.query(
            "INSERT INTO notifications (type, reference_id, message, created_at) VALUES (?, ?, ?, NOW())",
            ['report', reportId, `Report #${reportId} status has changed to ${status}!`]
        );

        const notificationId = notification.insertId;

        // 4️⃣ Link notification to the report owner
        await connection.query(
            "INSERT INTO notification_user (user_id, notification_id, is_read) VALUES (?, ?, 0)",
            [userId, notificationId]
        );

        // 5️⃣ Commit all
        await connection.commit();

        return res.status(200).json({ success: true, code: "STATUS_UPDATED", report });

    } catch (err) {
        await connection.rollback();
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    } finally {
        connection.release();
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
    const connection = await req.db.getConnection();
    try {
        await connection.beginTransaction();

        const [announcementResult] = await connection.query(
            "INSERT INTO announcements (title, content, is_published, created_by, updated_at) VALUES (?, ?, ?, ?, NOW())",
            [title, content, publish, userId]
        );

        const announcementId = announcementResult.insertId;

        if (publish) {
            const [notificationResult] = await connection.query(
                "INSERT INTO notifications (type, reference_id, message, created_at) VALUES (?, ?, ?, NOW())",
                ['announcement', announcementId, 'New announcement published!']
            );

            const notificationId = notificationResult.insertId;

            const [users] = await connection.query("SELECT id FROM users");

            if (users.length > 0) {
                const values = users.map(user => [
                    user.id,
                    notificationId,
                    0
                ]);
                await connection.query(
                    "INSERT INTO notification_user (user_id, notification_id, is_read) VALUES ?",
                    [values]
                );
            }
        }
        await connection.commit();
        return res.status(200).json({ success: true, code: "ANNOUNCEMENT_CREATED" });
    } catch (err) {
        await connection.rollback();
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    } finally {
        connection.release();
    }
};

exports.changeAnnouncementStatus = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, code: "FORBIDDEN" });
    }

    const announcementId = req.params.id;
    const action = req.params.action;

    if (action === 'publish') {
        const connection = await req.db.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                "UPDATE announcements SET is_published = 1, updated_at = NOW() WHERE id = ? AND is_published = 0",
                [announcementId]
            );
            if (result.affectedRows !== 1) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    code: "ALREADY_PUBLISHED"
                });
            }
            const [notification] = await connection.query(
                "INSERT INTO notifications (type, reference_id, message, created_at) VALUES (?, ?, ?, NOW())",
                ['announcement', announcementId, 'New announcement published!']
            );
            const notificationId = notification.insertId;
            const [users] = await connection.query("SELECT id FROM users");
            if (users.length > 0) {
                const values = users.map(user => [
                    user.id,
                    notificationId,
                    0
                ]);
                await connection.query(
                    "INSERT INTO notification_user (user_id, notification_id, is_read) VALUES ?",
                    [values]
                );
            }
            await connection.commit();
            return res.status(200).json({
                success: true,
                code: "ANNOUNCEMENT_PUBLISHED"
            });
        } catch (err) {
            await connection.rollback();
            return res.status(500).json({
                success: false,
                code: "DB_ERROR"
            });
        } finally {
            connection.release();
        }
    }

    if (action === 'unpublish') {
        const [result] = await req.db.query(
            "UPDATE announcements SET is_published = 0, updated_at = NOW() WHERE id = ?",
            [announcementId]
        );
        return result.affectedRows === 1
            ? res.status(200).json({ success: true, code: "ANNOUNCEMENT_UNPUBLISHED" })
            : res.status(500).json({ success: false, code: "DB_ERROR" });
    }

    if (action === 'archive') {
        const [result] = await req.db.query(
            "UPDATE announcements SET archived_at = NOW(), updated_at = NOW() WHERE id = ?",
            [announcementId]
        );
        return result.affectedRows === 1
            ? res.status(200).json({ success: true, code: "ANNOUNCEMENT_ARCHIVED" })
            : res.status(500).json({ success: false, code: "DB_ERROR" });
    }

    if (action === 'restore') {
        const [result] = await req.db.query(
            "UPDATE announcements SET archived_at = NULL, updated_at = NOW(), is_published = 0 WHERE id = ?",
            [announcementId]
        );
        return result.affectedRows === 1
            ? res.status(200).json({ success: true, code: "ANNOUNCEMENT_RESTORED" })
            : res.status(500).json({ success: false, code: "DB_ERROR" });
    }

    return res.status(400).json({ success: false, code: "INVALID_ACTION" });
};

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