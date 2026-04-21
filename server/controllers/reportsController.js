const validator = require('validator');
const fs = require("fs");
const path = require("path");

const CATEGORY_CODES = [
    "road",
    "lighting",
    "hygiene",
    "furniture",
    "traffic-signs",
    "parks"
];

exports.newReport = async (req, res) => {
    const { title, category, description, lat, lon } = req.body;
    const userId = req.user.id;
    const photoUrl = req.file ? `/uploads/reports/${req.file.filename}` : null;

    try {
        const trimmedTitle = validator.trim(title || "");
        const trimmedCategory = validator.trim(category || "");
        const trimmedDescription = validator.trim(description || "");
        const trimmedLat = validator.trim(lat || "");
        const trimmedLon = validator.trim(lon || "");

        if (!CATEGORY_CODES.includes(trimmedCategory)) {
            return res.status(400).json({ success: false, code: "INVALID_CATEGORY" });
        }

        if (!validator.isLength(trimmedTitle, { min: 1, max: 2000 }) ||
            !validator.isLength(trimmedCategory, { min: 1, max: 2000 }) ||
            !validator.isLength(trimmedDescription, { min: 1, max: 2000 })) {
            return res.status(400).json({ success: false, code: "INVALID_INPUTS" });
        }

        if (!validator.isDecimal(trimmedLat) || !validator.isDecimal(trimmedLon)) {
            return res.status(400).json({ success: false, code: "INVALID_COORDINATES" });
        }

        const floatLat = parseFloat(trimmedLat);
        const floatLon = parseFloat(trimmedLon);

        if (floatLat < -90 || floatLat > 90 || floatLon < -180 || floatLon > 180) {
            return res.status(400).json({ success: false, code: "INVALID_COORDINATES" });
        }

        const roundedLat = Number(floatLat.toFixed(5));
        const roundedLon = Number(floatLon.toFixed(5));
        const delta = 0.00001;

        let [rows] = await req.db.query(
            "SELECT * FROM locations WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
            [roundedLat - delta, roundedLat + delta, roundedLon - delta, roundedLon + delta]
        );

        let locationId = null;
        if (rows.length > 0) {
            locationId = rows[0].id;
        } else {
            let [locationResult] = await req.db.query(
                "INSERT INTO locations (latitude, longitude, created_at) VALUES (?, ?, NOW())",
                [roundedLat, roundedLon]
            );
            if (locationResult.affectedRows === 1) {
                locationId = locationResult.insertId;
            } else {
                return res.status(500).json({ success: false, code: "DB_ERROR" });
            }
        }

        let [reportResult] = await req.db.query(
            "INSERT INTO reports (user_id, location_id, title, description, category, photo_url, status, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())",
            [userId, locationId, trimmedTitle, trimmedDescription, trimmedCategory, photoUrl]
        );

        if (reportResult.affectedRows === 1) {
            res.status(201).json({
                success: true,
                code: "REPORT_CREATED",
                reportId: reportResult.insertId
            });
        } else {
            return res.status(500).json({ success: false, code: "DB_ERROR" });
        }

    } catch (e) {
        console.error("Error in adding report", e);
        return res.status(500).json({ success: false, code: "REPORT_ERROR" });
    }
};

exports.userReports = async (req, res) => {
    const userId = req.user.id ?? null;
    let [rows] = await req.db.query("SELECT * FROM users WHERE id=?", [userId]);
    if (rows.length === 0) {
        return res.status(400).json({ success: false, code: "USER_NOT_FOUND" });
    }

    let [reports] = await req.db.query("SELECT * FROM reports WHERE user_id = ?", [userId]);
    if (reports.length === 0) {
        return res.status(400).json({ success: false, code: "NO_USER_REPORTS" });
    }

    reports.forEach(report => {
        report.photo_url = report.photo_url
            ? `${req.protocol}://${req.get("host")}${report.photo_url}`
            : `${req.protocol}://${req.get("host")}/uploads/reports/no-image-report.png`;
    });

    return res.status(200).json({ success: true, reports });
};

exports.searchReports = async (req, res) => {
    const { title = "", category = "", status = "", date = "", sort = "" } = req.query;
    const userId = req.user.id;
    const allowedSortFields = ["title", "category", "status", "created_at"];
    let orderBy = "created_at", order = "DESC";

    if (sort && allowedSortFields.includes(sort)) {
        orderBy = sort;
        order = sort === "title" || sort === "category" ? "ASC" : "DESC";
    }

    let sql = `SELECT * FROM reports WHERE user_id = ?`;
    let params = [userId];

    if (title) { sql += " AND title LIKE ?"; params.push(`%${title}%`); }
    if (category) { sql += " AND category LIKE ?"; params.push(`%${category}%`); }
    if (status) { sql += " AND status LIKE ?"; params.push(`%${status}%`); }
    if (date) { sql += " AND DATE(created_at) >= ?"; params.push(date); }

    sql += ` ORDER BY ${orderBy} ${order}`;
    const [rows] = await req.db.query(sql, params);

    return res.status(200).json({ success: true, reports: rows });
};

exports.deleteReports = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, code: "NOT_AUTH" });
    if (!req.params.id) return res.status(400).json({ success: false, code: "MISSING_REPORT_ID" });

    const reportId = req.params.id;
    let [rows] = await req.db.query("DELETE FROM reports WHERE id = ?", [reportId]);

    if (rows.affectedRows === 1) {
        return res.status(200).json({ success: true, code: "REPORT_DELETED" });
    } else {
        return res.status(500).json({ success: false, code: "DB_ERROR" });
    }
};

exports.changeReportDetails = async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json({ success: false, code: "NOT_AUTH" });
    }

    const { reportId, title, category, description, lat, lon } = req.body;

    if (!reportId) {
        return res.status(400).json({ success: false, code: "MISSING_REPORT_ID" });
    }
    // Check report ownership and get old photo
    let [reportRows] = await req.db.query(
        `SELECT photo_url FROM reports WHERE id = ? AND user_id = ?`,
        [reportId, userId]
    );

    if (reportRows.length === 0) {
        return res.status(403).json({ success: false, code: "NOT_OWNER" });
    }

    const oldPhotoUrl = reportRows[0].photo_url;

    const photoUrl = req.file
        ? `/uploads/reports/${req.file.filename}`
        : null;

    try {

        // Trim
        const trimmedTitle = validator.trim(title || "");
        const trimmedCategory = validator.trim(category || "");
        const trimmedDescription = validator.trim(description || "");
        const trimmedLat = validator.trim(lat || "");
        const trimmedLon = validator.trim(lon || "");

        // Validate text
        if (
            !validator.isLength(trimmedTitle, { min: 1, max: 2000 }) ||
            !validator.isLength(trimmedCategory, { min: 1, max: 2000 }) ||
            !validator.isLength(trimmedDescription, { min: 1, max: 2000 })
        ) {
            return res.status(400).json({ success: false, code: "INVALID_INPUTS" });
        }

        if (!CATEGORY_CODES.includes(trimmedCategory)) {
            return res.status(400).json({ success: false, code: "INVALID_CATEGORY" });
        }

        // Validate coordinates
        if (
            !validator.isDecimal(trimmedLat) ||
            !validator.isDecimal(trimmedLon)
        ) {
            return res.status(400).json({ success: false, code: "INVALID_COORDINATES" });
        }

        const floatLat = parseFloat(trimmedLat);
        const floatLon = parseFloat(trimmedLon);

        if (
            floatLat < -90 || floatLat > 90 ||
            floatLon < -180 || floatLon > 180
        ) {
            return res.status(400).json({ success: false, code: "INVALID_COORDINATES" });
        }

        // Round same as newReport
        const roundedLat = Number(floatLat.toFixed(5));
        const roundedLon = Number(floatLon.toFixed(5));
        const delta = 0.00001;

        // Find or create location
        let [locationRows] = await req.db.query(
            `SELECT * FROM locations 
             WHERE latitude BETWEEN ? AND ? 
             AND longitude BETWEEN ? AND ?`,
            [
                roundedLat - delta,
                roundedLat + delta,
                roundedLon - delta,
                roundedLon + delta
            ]
        );

        let locationId;

        if (locationRows.length > 0) {

            locationId = locationRows[0].id;

        } else {

            let [locationResult] = await req.db.query(
                `INSERT INTO locations (latitude, longitude, created_at)
                 VALUES (?, ?, NOW())`,
                [roundedLat, roundedLon]
            );

            if (locationResult.affectedRows !== 1) {
                return res.status(500).json({ success: false, code: "DB_ERROR" });
            }

            locationId = locationResult.insertId;
        }

        // Check report ownership
        let [reportRows] = await req.db.query(
            `SELECT * FROM reports WHERE id = ? AND user_id = ?`,
            [reportId, userId]
        );

        if (reportRows.length === 0) {
            return res.status(403).json({ success: false, code: "NOT_OWNER" });
        }

        // Build dynamic update query
        let query;
        let params;

        if (photoUrl) {

            // DELETE old file if exists
            if (oldPhotoUrl) {

                const oldPath = path.join(
                    __dirname,
                    "..",
                    oldPhotoUrl // already contains "/uploads/reports/..."
                );
                if (!oldPath.includes("no-image-report.png")) {
                    fs.unlink(oldPath, (err) => {
                        if (err) {
                            console.error("Failed to delete old image:", err.message);
                        } else {
                            console.log("Old image deleted:", oldPath);
                        }
                    });
                }
            }

            query = `
        UPDATE reports
        SET
            title = ?,
            category = ?,
            description = ?,
            location_id = ?,
            photo_url = ?,
            updated_at = NOW()
        WHERE id = ? AND user_id = ?
    `;

            params = [
                trimmedTitle,
                trimmedCategory,
                trimmedDescription,
                locationId,
                photoUrl,
                reportId,
                userId
            ];

        } else {

            query = `
                UPDATE reports
                SET
                    title = ?,
                    category = ?,
                    description = ?,
                    location_id = ?,
                    updated_at = NOW()
                WHERE id = ? AND user_id = ?
            `;

            params = [
                trimmedTitle,
                trimmedCategory,
                trimmedDescription,
                locationId,
                reportId,
                userId
            ];
        }

        const [updateResult] = await req.db.query(query, params);

        if (updateResult.affectedRows !== 1) {
            return res.status(500).json({ success: false, code: "DB_ERROR" });
        }

        return res.status(200).json({
            success: true,
            code: "REPORT_UPDATED"
        });

    } catch (err) {

        console.error("Error updating report:", err);

        return res.status(500).json({
            success: false,
            code: "REPORT_UPDATE_ERROR"
        });
    }
};

exports.likeReport = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, code: "NOT_AUTH" });
    if (!req.params.id) return res.status(400).json({ success: false, code: "MISSING_REPORT_ID" });
    const reportId = req.params.id;
    const userId = req.user.id;
    let [rows] = await req.db.query("SELECT * FROM reports WHERE id = ?", [reportId]);
    if (rows.length === 0) {
        return res.status(400).json({ success: false, code: "NO_USER_REPORTS" });
    }
    const [like] = await req.db.query(
        "SELECT 1 FROM report_upvotes WHERE user_id = ? AND report_id = ?",
        [userId, reportId]
    );

    if (like.length > 0) {
        await req.db.query(
            "DELETE FROM report_upvotes WHERE user_id = ? AND report_id = ?",
            [userId, reportId]
        );
        return res.status(200).json({ success: true, code: "LIKE_REMOVED" });
    } else {
        await req.db.query(
            "INSERT INTO report_upvotes (user_id, report_id, created_at) VALUES (?, ?, NOW())",
            [userId, reportId]
        );
        return res.status(200).json({ success: true, code: "LIKE_ADDED" });
    }
}

exports.checkLike = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, code: "NOT_AUTH" });
    if (!req.params.id) return res.status(400).json({ success: false, code: "MISSING_REPORT_ID" });
    const reportId = req.params.id;
    const userId = req.user.id;
    const [like] = await req.db.query(
        "SELECT 1 FROM report_upvotes WHERE user_id = ? AND report_id = ?",
        [userId, reportId]
    );
    if (like.length > 0) {
        return res.status(200).json({ success: true, isLiked: true });
    } else {
        return res.status(200).json({ success: true, isLiked: false });
    }
}

exports.singleReportDetails = async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, code: "NOT_AUTH" });
    if (!req.params.id) return res.status(400).json({ success: false, code: "MISSING_REPORT_ID" });
    const reportId = req.params.id;
    let [rows] = await req.db.query("SELECT * FROM reports WHERE id = ?", [reportId]);
    if (rows.length === 0) {
        return res.status(400).json({ success: false, code: "NO_USER_REPORTS" });
    }
    return res.status(200).json({ success: true, report: rows[0] });
}